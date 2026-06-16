import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, hashIp } from "@/lib/security/ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sendEmail } from "@/lib/email/resend";
import { renderLeadEmail } from "@/lib/email/lead";
import { leadError, isEmail, LEAD_LIMITS } from "@/lib/lead";

export const runtime = "nodejs";
export const maxDuration = 15;

const BURST_LIMIT = 5; // submits per minute per IP per site
const BURST_WINDOW = 60;
const HOURLY_LIMIT = 20;
const HOURLY_WINDOW = 3600;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DASHBOARD = "https://www.bleviq.com/dashboard/sites/";

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
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin"), []),
  });
}

function json(body: unknown, status: number, headers: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

function clamp(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const baseHeaders = corsHeaders(origin, []);

  let widgetKey = "";
  let convoId = "";
  let name = "";
  let email = "";
  let phone = "";
  let message = "";
  let honeypot = "";
  try {
    const body = await req.json();
    widgetKey = String(body.widgetKey || "");
    name = clamp(body.name, LEAD_LIMITS.name);
    email = clamp(body.email, LEAD_LIMITS.email);
    phone = clamp(body.phone, LEAD_LIMITS.phone);
    message = clamp(body.message, LEAD_LIMITS.message);
    honeypot = String(body.hp || "");
    const cid = String(body.conversationId || "");
    if (UUID.test(cid)) convoId = cid.toLowerCase();
  } catch {
    return json({ error: "Bad request" }, 400, baseHeaders);
  }

  if (honeypot) return json({ error: "Rejected" }, 400, baseHeaders);
  if (!widgetKey) return json({ error: "Missing widgetKey" }, 400, baseHeaders);

  const verr = leadError({ name, email, phone, message });
  if (verr) return json({ error: verr }, 400, baseHeaders);

  const admin = createAdminClient();

  const { data: site } = await admin
    .from("sites")
    .select("id, user_id, name, domain, is_active, collect_leads, allowed_origins")
    .eq("widget_key", widgetKey)
    .single();

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

  if (site.collect_leads === false) {
    return json({ error: "Not accepting submissions" }, 403, headers);
  }

  const ipHash = hashIp(getClientIp(req));
  const burstOk = await checkRateLimit(
    admin,
    `lead:${site.id}:${ipHash}`,
    BURST_LIMIT,
    BURST_WINDOW
  );
  const hourlyOk = await checkRateLimit(
    admin,
    `lead:h:${site.id}:${ipHash}`,
    HOURLY_LIMIT,
    HOURLY_WINDOW
  );
  if (!burstOk || !hourlyOk) {
    return json({ error: "Too many requests. Please slow down." }, 429, headers);
  }

  // The widget's conversationId is the conversation's client_id; its primary
  // key (id) is a separate server-generated value. Resolve the real row so the
  // FK insert succeeds and the captured flag lands on the right conversation.
  let realConvoId: string | null = null;
  if (convoId) {
    const { data: conv } = await admin
      .from("conversations")
      .select("id")
      .eq("site_id", site.id)
      .eq("client_id", convoId)
      .maybeSingle();
    realConvoId = conv?.id ?? null;
  }

  // Store the lead (authoritative record, even if the email later fails).
  const { error: insertErr } = await admin.from("leads").insert({
    site_id: site.id,
    user_id: site.user_id,
    conversation_id: realConvoId,
    name: name || null,
    email: email || null,
    phone: phone || null,
    message: message || null,
  });
  if (insertErr) {
    console.error("lead insert failed:", insertErr.message);
    return json({ error: "Could not save. Please try again." }, 500, headers);
  }

  // Flag the conversation so the form never shows again and the model stops
  // trying to collect.
  if (realConvoId) {
    await admin
      .from("conversations")
      .update({ lead_captured_at: new Date().toISOString() })
      .eq("id", realConvoId);
  }

  // Email the owner (best-effort; the lead is already saved).
  try {
    const { data: owner } = await admin.auth.admin.getUserById(site.user_id);
    const to = owner?.user?.email;
    if (to) {
      const { subject, html, text } = renderLeadEmail({
        siteName: site.name || "your site",
        domain: site.domain ?? null,
        name: name || null,
        email: email || null,
        phone: phone || null,
        message: message || null,
        receivedAt: new Date().toISOString(),
        dashboardUrl: `${DASHBOARD}${site.id}`,
      });
      await sendEmail({
        to,
        subject,
        html,
        text,
        ...(email && isEmail(email) ? { replyTo: email } : {}),
      });
    }
  } catch (err) {
    console.error("lead email failed:", err);
  }

  return json({ ok: true }, 200, headers);
}
