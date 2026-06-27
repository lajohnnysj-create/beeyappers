import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { embedTexts } from "@/lib/embed/openai";
import { retrieveChunks, type MatchedChunk } from "@/lib/answer/retrieve";
import { rewriteQuery } from "@/lib/answer/rewrite";
import { generateAnswer, suggestAnswerableQuestions, type ChatTurn } from "@/lib/answer/generate";
import { getClientIp, hashIp } from "@/lib/security/ip";
import { countryFromReq, cityFromReq, deviceFromUA, browserFromUA } from "@/lib/analytics/visitor";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getEntitlementByUserId } from "@/lib/billing/entitlement";
import { PLANS } from "@/lib/billing/plans";
import { sendEmail } from "@/lib/email/resend";
import { renderUsageWarningEmail } from "@/lib/email/usage-warning";
import { FIELD_LIMITS } from "@/lib/field-limits";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_QUESTION_CHARS = FIELD_LIMITS.chatMessage;
const BURST_LIMIT = 20; // requests per minute, per IP per site (anti-flood)
const BURST_WINDOW = 60;
const HOURLY_LIMIT = 60; // requests per hour, per IP per site (sustained cap)
const HOURLY_WINDOW = 3600;
const TOP_K = 8;
// Reserve a few slots for owner-authored knowledge (FAQs AND uploaded
// documents, both page_id NULL) so it gets combined with crawled-page content
// even when page chunks outrank it. Gated by relevance (a fraction of the best
// chunk's similarity) so unrelated manual entries add no noise.
const MANUAL_RESERVE = 3;
const MANUAL_RELEVANCE = 0.5;

// Friendly copy shown when we have no answer. If we can suggest answerable
// questions, the line sets them up; otherwise it stands alone.
function noInfoText(hasSuggestions: boolean): string {
  return hasSuggestions
    ? "I don't have that one in my knowledge yet, but you can ask me about:"
    : "I don't have that information yet.";
}

const WARN_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // email at most once per 7 days

// Email the owner once they cross 80% of their monthly message cap. Best-effort
// and deduped to once per 7 days via subscriptions.usage_warned_at. Only called
// for accounts already near the limit, so the cooldown read stays off the hot
// path for everyone else. Never throws into the answer flow.
async function maybeWarnUsage(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  used: number,
  entitlement: Awaited<ReturnType<typeof getEntitlementByUserId>>
): Promise<void> {
  try {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("usage_warned_at")
      .eq("user_id", userId)
      .maybeSingle();
    const last = sub?.usage_warned_at
      ? new Date(sub.usage_warned_at).getTime()
      : 0;
    if (Date.now() - last < WARN_COOLDOWN_MS) return;

    const { data: owner } = await admin.auth.admin.getUserById(userId);
    const to = owner?.user?.email;
    if (!to) return;

    const { subject, html, text, replyTo } = renderUsageWarningEmail({
      used,
      cap: entitlement.messageCap,
      tierName: PLANS[entitlement.tier].name,
      canUpgrade: entitlement.tier !== "pro",
    });
    await sendEmail({ to, subject, html, text, replyTo });

    await admin
      .from("subscriptions")
      .update({ usage_warned_at: new Date().toISOString() })
      .eq("user_id", userId);
  } catch (err) {
    console.error("usage warning email failed:", err);
  }
}

type SiteRow = {
  id: string;
  user_id: string;
  is_active: boolean;
  system_prompt: string;
  allowed_origins: string[];
  monthly_token_cap: number;
  tokens_used_period: number;
  period_start: string;
  collect_leads: boolean | null;
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
  let history: ChatTurn[] = [];
  let clientConvoId = "";
  let lang = "";
  let leadCapturedHint = false;
  try {
    const body = await req.json();
    widgetKey = String(body.widgetKey || "");
    question = String(body.question || "").trim();
    honeypot = String(body.hp || "");
    lang = String(body.lang || "").slice(0, 35);
    leadCapturedHint = body.leadCaptured === true;
    // Client-generated id that threads every turn of one chat into a single
    // conversation. Only accept a well-formed UUID; anything else falls back to
    // the legacy "new row per message" behavior (client_id stays null).
    const cid = String(body.conversationId || "");
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cid)
    ) {
      clientConvoId = cid.toLowerCase();
    }
    // Recent turns for context. Keep it bounded: last 8 turns, each clamped to
    // the question length cap, only well-formed user/assistant entries.
    if (Array.isArray(body.history)) {
      history = body.history
        .filter(
          (t: unknown): t is { role: string; content: unknown } =>
            !!t && typeof t === "object"
        )
        .map((t: { role: string; content: unknown }) => ({
          role: t.role === "assistant" ? "assistant" : "user",
          content: String(t.content ?? "").slice(0, MAX_QUESTION_CHARS),
        }))
        .filter((t: ChatTurn) => t.content.trim().length > 0)
        .slice(-8) as ChatTurn[];
    }
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
        "monthly_token_cap, tokens_used_period, period_start, collect_leads"
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

  // 4. Per-IP rate limits: a short burst cap to stop flooding, plus an
  //    hourly cap so one visitor can't run up usage over a whole session.
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);
  // Privacy-safe visitor attributes for analytics (no IP stored).
  const country = countryFromReq(req);
  const city = cityFromReq(req);
  const ua = req.headers.get("user-agent");
  const device = deviceFromUA(ua);
  const browser = browserFromUA(ua);
  const burstOk = await checkRateLimit(
    admin,
    `answer:${site.id}:${ipHash}`,
    BURST_LIMIT,
    BURST_WINDOW
  );
  if (!burstOk) {
    return json({ error: "Too many requests. Please slow down." }, 429, headers);
  }
  const hourlyOk = await checkRateLimit(
    admin,
    `answer:h:${site.id}:${ipHash}`,
    HOURLY_LIMIT,
    HOURLY_WINDOW
  );
  if (!hourlyOk) {
    return json(
      { error: "You've reached the message limit for now. Please try again later." },
      429,
      headers
    );
  }

  // 5. Entitlement: the widget only serves answers while the owner's account
  //    is on an active plan or trial. This check is before any paid OpenAI
  //    call, so an inactive account costs nothing.
  const entitlement = await getEntitlementByUserId(site.user_id);
  if (!entitlement.active) {
    return json(
      { answer: "This chat is currently unavailable. Please check back soon." },
      200,
      headers
    );
  }

  // Rolling 30-day message cap, per account (across all the owner's sites).
  // Counts the per-user usage ledger, not public.messages, so deleting a site
  // (which cascade-deletes its messages) can't reset the count.
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: msgsUsed } = await admin
    .from("message_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", site.user_id)
    .gte("created_at", since30);
  if ((msgsUsed ?? 0) >= entitlement.messageCap) {
    return json(
      { error: "This assistant has reached its monthly message limit." },
      429,
      headers
    );
  }

  // 5b. Nudge the owner once they cross 80% of the cap (here we know usage is
  //     below the cap). Best-effort and deduped to once per 7 days.
  if ((msgsUsed ?? 0) >= entitlement.messageCap * 0.8) {
    await maybeWarnUsage(admin, site.user_id, msgsUsed ?? 0, entitlement);
  }

  // 6. Monthly token cap (the hard spend backstop). The stored per-site cap is
  //    a created-at default that is NOT lifted when an account upgrades, so on
  //    its own it can throttle a paid account below its plan. Floor it to the
  //    tier's allowance (messageCap x a generous per-reply token budget, the
  //    same basis set_message_cap_override uses) so a paying customer is never
  //    capped below their plan. A higher per-site cap (admin override) still wins.
  const PER_REPLY_TOKEN_BUDGET = 10000; // keep in sync with set_message_cap_override()
  const tokenCap = Math.max(
    site.monthly_token_cap,
    entitlement.messageCap * PER_REPLY_TOKEN_BUDGET
  );
  const thisMonth = new Date().toISOString().slice(0, 7);
  const periodMonth = (site.period_start || "").slice(0, 7);
  const usedThisPeriod = periodMonth < thisMonth ? 0 : site.tokens_used_period;
  if (usedThisPeriod >= tokenCap) {
    return json(
      { error: "This assistant has reached its usage limit for now." },
      429,
      headers
    );
  }

  try {
    // 6. Rewrite the question, then retrieve using BOTH the original and the
    //    rewritten query, merging results so messy phrasing still finds the
    //    right content.
    const rewritten = await rewriteQuery(question, history);
    const queries = [question];
    if (rewritten && rewritten.toLowerCase() !== question.toLowerCase()) {
      queries.push(rewritten);
    }

    const embeddings = await embedTexts(queries);
    const byId = new Map<string, MatchedChunk>();
    for (const emb of embeddings) {
      const got = await retrieveChunks(admin, site.id, emb, TOP_K);
      for (const c of got) {
        const prev = byId.get(c.id);
        if (!prev || c.similarity > prev.similarity) byId.set(c.id, c);
      }
    }
    const chunks = [...byId.values()]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, TOP_K);

    // Make sure relevant owner-authored knowledge (FAQs and uploaded documents)
    // rides along even when page chunks fill the top slots. Pull manual-only
    // matches, keep those at least half as similar as the best chunk, and merge
    // them in (deduped).
    const topSim = chunks.length ? chunks[0].similarity : 0;
    const manualById = new Map<string, MatchedChunk>();
    for (const emb of embeddings) {
      const got = await retrieveChunks(admin, site.id, emb, MANUAL_RESERVE, true);
      for (const c of got) {
        const prev = manualById.get(c.id);
        if (!prev || c.similarity > prev.similarity) manualById.set(c.id, c);
      }
    }
    const haveIds = new Set(chunks.map((c) => c.id));
    const manualExtra = [...manualById.values()]
      .filter(
        (c) => !haveIds.has(c.id) && c.similarity >= topSim * MANUAL_RELEVANCE
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MANUAL_RESERVE);
    const merged = [...chunks, ...manualExtra].sort(
      (a, b) => b.similarity - a.similarity
    );

    // Page list (for linking + suggestions) and FAQ questions (for suggestions).
    const { data: pageRows } = await admin
      .from("pages")
      .select("url, title")
      .eq("site_id", site.id)
      .limit(200);
    const pages = (pageRows ?? [])
      .map((p) => ({ title: (p.title || p.url) as string, url: p.url as string }))
      .filter((p) => /^https?:\/\//i.test(p.url))
      .sort((a, b) => a.url.length - b.url.length)
      .slice(0, 30);

    // Linkable pages, ordered by relevance to THIS question: the pages whose
    // chunks actually matched come first, so the model can send the visitor to
    // the exact product or topic they asked about (for example a specific
    // product page). A few short top-level pages follow as fallback so general
    // asks (contact, pricing) still resolve. Manual FAQ/document chunks have a
    // null url and are skipped here.
    const titleByUrl = new Map<string, string>();
    for (const p of pageRows ?? []) {
      const u = String((p as { url?: string }).url || "");
      if (u) titleByUrl.set(u, String((p as { title?: string }).title || u));
    }
    const seenLinkUrl = new Set<string>();
    const linkablePages: { title: string; url: string }[] = [];
    for (const c of merged) {
      const u = (c.url || "").trim();
      if (u && /^https?:\/\//i.test(u) && !seenLinkUrl.has(u)) {
        seenLinkUrl.add(u);
        linkablePages.push({ title: titleByUrl.get(u) || u, url: u });
      }
    }
    for (const p of pages) {
      if (!seenLinkUrl.has(p.url)) {
        seenLinkUrl.add(p.url);
        linkablePages.push(p);
      }
    }
    const linkPages = linkablePages.slice(0, 12);

    const { data: faqRows } = await admin
      .from("chunks")
      .select("source_label")
      .eq("site_id", site.id)
      .eq("source_type", "faq")
      .limit(50);
    const faqQuestions = (faqRows ?? [])
      .map((r) => String(r.source_label || "").trim())
      .filter(Boolean);

    // A broad sample of the site's ACTUAL indexed content. Suggestions are
    // grounded in this (plus FAQs) so the widget never offers a question the
    // assistant can't actually answer. Spread across chunks for topic variety.
    const { data: sampleRows } = await admin
      .from("chunks")
      .select("content")
      .eq("site_id", site.id)
      .limit(80);
    const contentSamples = (sampleRows ?? [])
      .map((r) =>
        String(r.content || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 240)
      )
      .filter((s) => s.length > 0)
      .filter((_, i) => i % 4 === 0)
      .slice(0, 20);

    // Lead-capture availability is decided up front so an actionable request
    // (cancel, reschedule, "where's my order") can reach the model and trigger
    // the form, instead of being swallowed by the no-context reply below.
    let leadCaptured = leadCapturedHint;
    if (!leadCaptured && clientConvoId) {
      const { data: conv } = await admin
        .from("conversations")
        .select("lead_captured_at")
        .eq("site_id", site.id)
        .eq("client_id", clientConvoId)
        .maybeSingle();
      if (conv?.lead_captured_at) leadCaptured = true;
    }
    const canCollectLead = site.collect_leads !== false && !leadCaptured;

    // With no matching content AND no form to offer, send the friendly no-info
    // reply. When the form IS available we fall through to the model so it can
    // detect an actionable intent and decide whether to collect.
    if (chunks.length === 0 && !canCollectLead) {
      const suggestions = await suggestAnswerableQuestions(faqQuestions, contentSamples, lang);
      return json(
        { answer: noInfoText(suggestions.length > 0), suggestions },
        200,
        headers
      );
    }

    const context = merged.map((c, i) => `[${i + 1}] ${c.content}`).join("\n\n");

    // 7. Generate the answer with guardrails.
    const gen = await generateAnswer(
      site.system_prompt,
      context,
      question,
      linkPages,
      history,
      lang,
      canCollectLead,
      entitlement.model
    );
    const collectInfo = canCollectLead && gen.collectInfo;
    let answer = gen.answer;
    const totalTokens = gen.totalTokens;
    let suggestions: string[] | undefined;

    // The model returns answered:false when the context doesn't cover the
    // question. It now also writes a short, topic-aware "I don't have info on
    // X" line, which we keep; we only fall back to the generic copy when the
    // model gave nothing. Either way we attach questions the site CAN answer.
    if (!gen.answered || !answer.trim()) {
      suggestions = await suggestAnswerableQuestions(faqQuestions, contentSamples, lang);
      if (!answer.trim()) {
        answer = noInfoText(suggestions.length > 0);
      }
    }

    // 8. Account for spend and log the exchange (best-effort).
    await admin.rpc("add_site_token_usage", {
      p_site_id: site.id,
      p_tokens: totalTokens,
    });

    // Find-or-create the conversation, then append this turn. With a real
    // conversationId, all turns of one chat thread into a single row and
    // last_message_at is bumped so the transcript sweep can tell when the chat
    // went quiet. Without one (legacy/blocked storage), each turn is its own
    // row, as before.
    const nowIso = new Date().toISOString();
    let convoId: string | null = null;

    if (clientConvoId) {
      const { data: existing } = await admin
        .from("conversations")
        .select("id")
        .eq("site_id", site.id)
        .eq("client_id", clientConvoId)
        .maybeSingle();
      if (existing) {
        convoId = existing.id;
        await admin
          .from("conversations")
          .update({ last_message_at: nowIso })
          .eq("id", convoId);
      }
    }

    if (!convoId) {
      const { data: convo } = await admin
        .from("conversations")
        .insert({
          site_id: site.id,
          user_id: site.user_id,
          origin: origin,
          ip_hash: ipHash,
          client_id: clientConvoId || null,
          last_message_at: nowIso,
          country: country,
          city: city,
          device: device,
          browser: browser,
        })
        .select("id")
        .single();
      convoId = convo?.id ?? null;
    }

    // Record one unit of usage for the monthly cap. This lives in a per-user
    // ledger with no site/conversation link, so deleting a site can't reset it.
    // Written for every reply, even when conversation logging is skipped below.
    await admin.from("message_usage").insert({ user_id: site.user_id });

    if (convoId) {
      await admin.from("messages").insert([
        {
          conversation_id: convoId,
          user_id: site.user_id,
          role: "user",
          content: question,
        },
        {
          conversation_id: convoId,
          user_id: site.user_id,
          role: "assistant",
          content: answer,
          token_count: totalTokens,
        },
      ]);
    }

    return json(
      {
        answer,
        ...(suggestions ? { suggestions } : {}),
        ...(collectInfo ? { collectInfo: true } : {}),
      },
      200,
      headers
    );
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
