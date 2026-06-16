// Renders a lead notification into a branded HTML email, matching the look of
// the transcript email. Visitor-typed content is escaped before going into the
// HTML, since it's untrusted free text.

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(iso: string): string {
  try {
    return (
      new Date(iso).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }) + " UTC"
    );
  } catch {
    return iso;
  }
}

export function renderLeadEmail(opts: {
  siteName: string;
  domain: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  receivedAt: string;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const { siteName, domain, name, email, phone, message, receivedAt, dashboardUrl } =
    opts;

  const subject = `New lead from ${siteName}`;
  const where = domain ? esc(domain) : "your site";

  const row = (label: string, valueHtml: string) => `
        <tr>
          <td style="padding:0 0 14px 0;">
            <div style="font-family:${FONT}; font-size:12px; font-weight:600; color:#4338ca; margin:0 0 4px 0;">${esc(
              label
            )}</div>
            <div style="font-family:${FONT}; font-size:15px; line-height:1.5; color:#0f172a; word-wrap:break-word; white-space:pre-wrap;">${valueHtml}</div>
          </td>
        </tr>`;

  const rows: string[] = [];
  if (name) rows.push(row("Name", esc(name)));
  if (email)
    rows.push(
      row(
        "Email",
        `<a href="mailto:${esc(email)}" style="color:#4f46e5; text-decoration:none;">${esc(
          email
        )}</a>`
      )
    );
  if (phone)
    rows.push(
      row(
        "Phone",
        `<a href="tel:${esc(phone)}" style="color:#4f46e5; text-decoration:none;">${esc(
          phone
        )}</a>`
      )
    );
  if (message) rows.push(row("What they asked", esc(message)));
  const details = rows.join("");

  const preview = (name || email || phone || "New lead").slice(0, 120);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0; background:#f7f8fb;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${esc(preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fb; padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:92%; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0;">
        <tr><td style="height:5px; background:#4f46e5;"></td></tr>
        <tr><td style="padding:28px 28px 8px 28px;">
          <img src="https://www.bleviq.com/logo.png" alt="Bleviq" width="87" height="36" style="display:block; border:0; width:87px; height:36px;">
        </td></tr>
        <tr><td style="padding:8px 28px 0 28px; font-family:${FONT};">
          <h1 style="margin:0; font-size:18px; color:#0f172a;">New lead from ${esc(
            siteName
          )}</h1>
          <p style="margin:6px 0 0 0; font-size:13px; color:#64748b;">${where} &middot; received ${esc(
            fmtDate(receivedAt)
          )}</p>
        </td></tr>
        <tr><td style="padding:20px 28px 8px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${details}</table>
        </td></tr>
        <tr><td style="padding:8px 28px 28px 28px;">
          <a href="${esc(
            dashboardUrl
          )}" style="display:inline-block; background:#4f46e5; color:#ffffff; text-decoration:none; font-family:${FONT}; font-size:14px; font-weight:600; padding:11px 20px; border-radius:10px;">View in dashboard</a>
        </td></tr>
        <tr><td style="padding:0 28px 28px 28px; font-family:${FONT}; font-size:12px; color:#94a3b8; border-top:1px solid #f1f5f9;">
          <p style="margin:16px 0 0 0;">You're getting this because lead capture is on for ${esc(
            siteName
          )}. You can turn it off in your dashboard.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text =
    `New lead from ${siteName} (${domain || "your site"})\n` +
    `Received ${fmtDate(receivedAt)}\n\n` +
    [
      name && `Name: ${name}`,
      email && `Email: ${email}`,
      phone && `Phone: ${phone}`,
      message && `What they asked: ${message}`,
    ]
      .filter(Boolean)
      .join("\n") +
    `\n\nOpen dashboard: ${dashboardUrl}`;

  return { subject, html, text };
}
