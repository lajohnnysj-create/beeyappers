// Renders a chat transcript into a branded HTML email. Visitor-typed content is
// always escaped before it goes into the HTML, since it's untrusted free text.

type Msg = { role: string; content: string; created_at?: string };

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }) + " UTC";
  } catch {
    return iso;
  }
}

export function renderTranscriptEmail(opts: {
  siteName: string;
  domain: string | null;
  messages: Msg[];
  startedAt: string;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const { siteName, domain, messages, startedAt, dashboardUrl } = opts;

  const firstQ =
    messages.find((m) => m.role === "user")?.content?.trim() || "New chat";
  const subject = `New chat on ${siteName}`;

  const bubbles = messages
    .map((m) => {
      const isUser = m.role === "user";
      const who = isUser ? "Visitor" : siteName;
      const align = isUser ? "left" : "left";
      const bg = isUser ? "#eef2ff" : "#f1f5f9";
      const labelColor = isUser ? "#4338ca" : "#475569";
      return `
        <tr>
          <td style="padding:0 0 14px 0;" align="${align}">
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:12px; font-weight:600; color:${labelColor}; margin:0 0 4px 0;">${esc(
              who
            )}</div>
            <div style="display:inline-block; max-width:100%; background:${bg}; border-radius:12px; padding:10px 14px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:14px; line-height:1.5; color:#0f172a; white-space:pre-wrap; word-wrap:break-word;">${esc(
              m.content
            )}</div>
          </td>
        </tr>`;
    })
    .join("");

  const where = domain ? esc(domain) : "your site";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0; background:#f7f8fb;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${esc(
    firstQ
  ).slice(0, 120)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fb; padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:92%; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0;">
        <tr><td style="height:5px; background:#4f46e5;"></td></tr>
        <tr><td style="padding:28px 28px 8px 28px;">
          <img src="https://www.bleviq.com/logo.png" alt="Bleviq" width="87" height="36" style="display:block; border:0; width:87px; height:36px;">
        </td></tr>
        <tr><td style="padding:8px 28px 0 28px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <h1 style="margin:0; font-size:18px; color:#0f172a;">New chat on ${esc(
            siteName
          )}</h1>
          <p style="margin:6px 0 0 0; font-size:13px; color:#64748b;">${where} &middot; started ${esc(
            fmtDate(startedAt)
          )} &middot; ${messages.length} message${
    messages.length === 1 ? "" : "s"
  }</p>
        </td></tr>
        <tr><td style="padding:20px 28px 8px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${bubbles}</table>
        </td></tr>
        <tr><td style="padding:8px 28px 28px 28px;">
          <a href="${esc(
            dashboardUrl
          )}" style="display:inline-block; background:#4f46e5; color:#ffffff; text-decoration:none; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:14px; font-weight:600; padding:11px 20px; border-radius:10px;">Open dashboard</a>
        </td></tr>
        <tr><td style="padding:0 28px 28px 28px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:12px; color:#94a3b8; border-top:1px solid #f1f5f9;">
          <p style="margin:16px 0 0 0;">You're getting this because transcript emails are on for ${esc(
            siteName
          )}. You can turn them off in your dashboard.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text =
    `New chat on ${siteName} (${domain || "your site"})\n` +
    `Started ${fmtDate(startedAt)} — ${messages.length} messages\n\n` +
    messages
      .map((m) => `${m.role === "user" ? "Visitor" : siteName}: ${m.content}`)
      .join("\n\n") +
    `\n\nOpen dashboard: ${dashboardUrl}`;

  return { subject, html, text };
}
