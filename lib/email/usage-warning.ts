import "server-only";

// Inbox for "contact sales" replies. Set SALES_EMAIL to route these wherever
// you want; the fallback is the MRLA Media contact address.
const CONTACT_EMAIL = process.env.SALES_EMAIL || "johnnyla@mrla-media.com";
const PRICING_URL = "https://www.bleviq.com/pricing";

/**
 * Email sent to a site owner when their account crosses 80% of its monthly
 * message limit. canUpgrade is false on the top plan (nothing higher to
 * self-serve), so the CTA points to a custom-plan conversation instead.
 */
export function renderUsageWarningEmail(opts: {
  used: number;
  cap: number;
  tierName: string;
  canUpgrade: boolean;
}): { subject: string; html: string; text: string; replyTo: string } {
  const { used, cap, tierName, canUpgrade } = opts;
  const pct = Math.min(99, Math.round((used / cap) * 100));
  const remaining = Math.max(0, cap - used);

  const subject = `You've used ${pct}% of your Bleviq messages this month`;

  const ctaHref = canUpgrade ? PRICING_URL : `mailto:${CONTACT_EMAIL}`;
  const ctaLabel = canUpgrade
    ? "Upgrade your plan"
    : "Contact us about a custom plan";

  const bodyLine = canUpgrade
    ? "To keep answering visitors without interruption, upgrade your plan for a higher monthly limit, or reply to this email if you'd like help picking one."
    : "You're on our highest plan. If you need a higher limit, just reply and we'll set up a custom plan for you.";

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:8px 4px;color:#0f172a;">
    <h1 style="font-size:20px;line-height:1.3;margin:0 0 12px;">You're close to your message limit</h1>
    <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 16px;">
      Your Bleviq chatbot has used <strong>${used} of ${cap}</strong> messages on your ${tierName} plan this month (about ${pct}%). About <strong>${remaining}</strong> remain before it pauses for new visitors.
    </p>
    <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 22px;">
      ${bodyLine}
    </p>
    <p style="margin:0 0 24px;">
      <a href="${ctaHref}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:9999px;">${ctaLabel}</a>
    </p>
    <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">
      Your limit resets on a rolling 30-day basis, so available messages recover as older ones age out. Questions? Just reply to this email.
    </p>
  </div>`;

  const ctaText = canUpgrade
    ? `Upgrade your plan for a higher monthly limit: ${PRICING_URL}`
    : `You're on our top plan. Reply to this email or contact ${CONTACT_EMAIL} for a custom limit.`;

  const text = `You're close to your Bleviq message limit.

Your chatbot has used ${used} of ${cap} messages on your ${tierName} plan this month (about ${pct}%). About ${remaining} remain before it pauses for new visitors.

${ctaText}

Your limit resets on a rolling 30-day basis. Questions? Just reply to this email.`;

  return { subject, html, text, replyTo: CONTACT_EMAIL };
}
