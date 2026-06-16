// Pure, dependency-free validation for the lead form. Used client-side to
// enable the submit button and show inline errors, and server-side as the
// authoritative check. No field is individually required, but a lead must carry
// at least one contact method (email or phone) to be useful.

export const LEAD_LIMITS = {
  name: 80,
  email: 254,
  phone: 32,
  message: 1000,
};

export function isEmail(s: string): boolean {
  const v = (s || "").trim();
  return v.length <= LEAD_LIMITS.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function isPhone(s: string): boolean {
  const v = (s || "").trim();
  const digits = v.replace(/[^0-9]/g, "");
  return /^[0-9+()\-.\s]+$/.test(v) && digits.length >= 7 && digits.length <= 15;
}

export type LeadInput = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

// Returns null when valid, or a short reason when not.
export function leadError(input: LeadInput): string | null {
  const email = (input.email || "").trim();
  const phone = (input.phone || "").trim();
  if (!email && !phone) return "Add an email or phone number.";
  if (email && !isEmail(email)) return "That email does not look right.";
  if (phone && !isPhone(phone)) return "That phone number does not look right.";
  return null;
}
