import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { embedTexts } from "@/lib/embed/openai";
import { retrieveChunks } from "@/lib/answer/retrieve";
import { generateAnswer } from "@/lib/answer/generate";
import { getClientIp, hashIp } from "@/lib/security/ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_QUESTION_CHARS = 1000;
const RATE_LIMIT = 20; // requests
const RATE_WINDOW = 60; // seconds, per IP per site
const TOP_K = 5;

type SiteRow = {
  id: string;
  user_id: string;
  is_active: boolean;
  system_prompt: string;
  allowed_origins: string[];
  monthly_token_cap: number;
  tokens_used_period: number;
  period_start: string;
};

// ---- CORS helpers ----------------------------------------------------------
function corsHeaders(origin: string | null, allowed: string[]): HeadersInit {
  // Reflect the origin when it is allowed (or when no allowlist is set yet).
  const ok =
    !origin || allowed.length === 0 || allowed.includes(origin)
      ? origin || "*"
      : "null";
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  // Preflight. We don't know the allowlist without the widgetKey, so reflect.
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin, []),
  });
}

function json(body: unknown, status: number, headers: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const baseHeaders = corsHeaders(origin, []);

  // 1. Parse and validate input.
  let widgetKey = "";
  let question = "";
  let honeypot = "";
  try {
    const body = await req.json();
    widgetKey = String(body.widgetKey || "");
    question = String(body.question || "").trim();
    honeypot = String(body.hp || "");
  } catch {
    return json({ error: "Bad request" }, 400, baseHeaders);
  }

  // Honeypot: a real visitor never fills this hidden field. Drop silently.
  if (honeypot) return json({ error: "Rejected" }, 400, baseHeaders);

  if (!widgetKey) return json({ error: "Missing widgetKey" }, 400, baseHeaders);
  if (!question) return json({ error: "Empty question" }, 400, baseHeaders);
  if (question.length > MAX_QUESTION_CHARS) {
    return json({ error: "Question too long" }, 400, baseHeaders);
  }

  const admin = createAdminClient();

  // 2. Resolve the site from the PUBLIC widget key (never a trusted user_id).
  const { data: site } = await admin
    .from("sites")
    .select(
      "id, user_id, is_active, system_prompt, allowed_origins, " +
        "monthly_token_cap, tokens_used_period, period_start"
    )
    .eq("widget_key", widgetKey)
    .single<SiteRow>();

  if (!site || !site.is_active) {
    return json({ error: "Unknown widget" }, 404, baseHeaders);
  }

  // Recompute CORS now that we have the site's allowlist.
  const headers = corsHeaders(origin, site.allowed_origins || []);

  // 3. Origin allowlist (enforced only once the owner has configured it).
  if (
    site.allowed_origins &&
    site.allowed_origins.length > 0 &&
    origin &&
    !site.allowed_origins.includes(origin)
  ) {
    return json({ error: "Origin not allowed" }, 403, headers);
  }

  // 4. Per-IP rate limit.
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);
  const allowed = await checkRateLimit(
    admin,
    `answer:${site.id}:${ipHash}`,
    RATE_LIMIT,
    RATE_WINDOW
  );
  if (!allowed) {
    return json({ error: "Too many requests. Slow down." }, 429, headers);
  }

  // 5. Monthly token cap (the hard spend backstop).
  const thisMonth = new Date().toISOString().slice(0, 7);
  const periodMonth = (site.period_start || "").slice(0, 7);
  const usedThisPeriod = periodMonth < thisMonth ? 0 : site.tokens_used_period;
  if (usedThisPeriod >= site.monthly_token_cap) {
    return json(
      { error: "This assistant has reached its usage limit for now." },
      429,
      headers
    );
  }

  try {
    // 6. Embed the question and retrieve the most relevant chunks.
    const [queryEmbedding] = await embedTexts([question]);
    const chunks = await retrieveChunks(
      admin,
      site.id,
      queryEmbedding,
      TOP_K
    );

    if (chunks.length === 0) {
      return json(
        {
          answer:
            "I don't have any information about that yet. The site may not be fully set up.",
        },
        200,
        headers
      );
    }

    const context = chunks.map((c, i) => `[${i + 1}] ${c.content}`).join("\n\n");

    // 7. Generate the answer with guardrails.
    const { answer, totalTokens } = await generateAnswer(
      site.system_prompt,
      context,
      question
    );

    // 8. Account for spend and log the exchange (best-effort).
    await admin.rpc("add_site_token_usage", {
      p_site_id: site.id,
      p_tokens: totalTokens,
    });

    const { data: convo } = await admin
      .from("conversations")
      .insert({
        site_id: site.id,
        user_id: site.user_id,
        origin: origin,
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (convo) {
      await admin.from("messages").insert([
        {
          conversation_id: convo.id,
          user_id: site.user_id,
          role: "user",
          content: question,
        },
        {
          conversation_id: convo.id,
          user_id: site.user_id,
          role: "assistant",
          content: answer,
          token_count: totalTokens,
        },
      ]);
    }

    return json({ answer }, 200, headers);
  } catch (err) {
    // Never leak internal detail to the public client.
    console.error("answer route error:", err);
    return json(
      { error: "Something went wrong generating an answer." },
      500,
      headers
    );
  }
}
