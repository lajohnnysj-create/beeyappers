import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/security/ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BURST_LIMIT = 30; // per IP per site, per minute
const BURST_WINDOW = 60;
const MAX_MESSAGES = 100;

function corsHeaders(origin: string | null, allowed: string[]): HeadersInit {
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
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin, []) });
}

function json(body: unknown, status: number, headers: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

// Returns the prior turns of one chat so the widget can resume it after a
// refresh, navigation, or tab reopen. The conversation id is an unguessable
// client-generated UUID that acts as the bearer token for that single thread;
// results are always scoped to the requesting site AND that id.
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const baseHeaders = corsHeaders(origin, []);

  let widgetKey = "";
  let conversationId = "";
  try {
    const body = await req.json();
    widgetKey = String(body.widgetKey || "");
    const cid = String(body.conversationId || "");
    if (UUID_RE.test(cid)) conversationId = cid.toLowerCase();
  } catch {
    return json({ error: "Bad request" }, 400, baseHeaders);
  }

  if (!widgetKey) return json({ error: "Missing widgetKey" }, 400, baseHeaders);
  // No valid id means there's nothing to resume; not an error.
  if (!conversationId) {
    return json({ messages: [], leadCaptured: false }, 200, baseHeaders);
  }

  const admin = createAdminClient();

  const { data: site } = await admin
    .from("sites")
    .select("id, is_active, allowed_origins")
    .eq("widget_key", widgetKey)
    .single<{ id: string; is_active: boolean; allowed_origins: string[] }>();

  if (!site || !site.is_active) {
    return json({ error: "Unknown widget" }, 404, baseHeaders);
  }

  const headers = corsHeaders(origin, site.allowed_origins || []);
  if (
    site.allowed_origins &&
    site.allowed_origins.length > 0 &&
    origin &&
    !site.allowed_origins.includes(origin)
  ) {
    return json({ error: "Origin not allowed" }, 403, headers);
  }

  const ip = getClientIp(req);
  const ok = await checkRateLimit(
    admin,
    `convo:${ip}:${site.id}`,
    BURST_LIMIT,
    BURST_WINDOW
  );
  if (!ok) return json({ error: "Too many requests" }, 429, headers);

  // Resolve the conversation for THIS site + client id only.
  const { data: convo } = await admin
    .from("conversations")
    .select("id, lead_captured_at")
    .eq("site_id", site.id)
    .eq("client_id", conversationId)
    .maybeSingle<{ id: string; lead_captured_at: string | null }>();

  if (!convo) {
    return json({ messages: [], leadCaptured: false }, 200, headers);
  }

  const { data: rows } = await admin
    .from("messages")
    .select("role, content, created_at")
    .eq("conversation_id", convo.id)
    .order("created_at", { ascending: true })
    .limit(MAX_MESSAGES);

  const messages = (rows || [])
    .filter(
      (m): m is { role: string; content: string; created_at: string } =>
        !!m && (m.role === "user" || m.role === "assistant")
    )
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content ?? ""),
    }));

  return json({ messages, leadCaptured: !!convo.lead_captured_at }, 200, headers);
}
