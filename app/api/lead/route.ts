import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, hashIp } from "@/lib/security/ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sendEmail } from "@/lib/email/resend";
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

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  // Store the lead (authoritative record, even if the email later fails).
  await admin.from("leads").insert({
    site_id: site.id,
    user_id: site.user_id,
    conversation_id: convoId || null,
    name: name || null,
    email: email || null,
    phone: phone || null,
    message: message || null,
  });

  // Flag the conversation so the form never shows again and the model stops
  // trying to collect. Scoped to this site so a visitor can't touch another's.
  if (convoId) {
    await admin
      .from("conversations")
      .update({ lead_captured_at: new Date().toISOString() })
      .eq("id", convoId)
      .eq("site_id", site.id);
  }

  // Email the owner (best-effort; the lead is already saved).
  try {
    const { data: owner } = await admin.auth.admin.getUserById(site.user_id);
    const to = owner?.user?.email;
    if (to) {
      const rows: string[] = [];
      if (name) rows.push(`<strong>Name:</strong> ${esc(name)}`);
      if (email) rows.push(`<strong>Email:</strong> ${esc(email)}`);
      if (phone) rows.push(`<strong>Phone:</strong> ${esc(phone)}`);
      if (message) rows.push(`<strong>They asked:</strong> ${esc(message)}`);
      const html = `
        <div style="font-family:system-ui,sans-serif;font-size:15px;color:#0f172a">
          <p>You have a new lead from <strong>${esc(site.name || "your site")}</strong>.</p>
          <p>${rows.join("<br>")}</p>
          <p><a href="${DASHBOARD}${site.id}">View it in your dashboard</a></p>
        </div>`;
      const text =
        `New lead from ${site.name || "your site"}\n\n` +
        [
          name && `Name: ${name}`,
          email && `Email: ${email}`,
          phone && `Phone: ${phone}`,
          message && `They asked: ${message}`,
        ]
          .filter(Boolean)
          .join("\n");
      await sendEmail({
        to,
        subject: `New lead from ${site.name || "your site"}`,
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
