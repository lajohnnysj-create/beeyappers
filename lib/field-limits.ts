// Central character limits for user-entered fields. Used both for the input
// maxLength on the client AND for clamping on the server, since maxLength is
// trivially bypassed (devtools, scripted requests). Tweak in one place.
export const FIELD_LIMITS = {
  domain: 255, // website address
  siteName: 60,
  assistantName: 40, // AI assistant display name
  greeting: 300, // welcome message
  launcherLabel: 40, // chat bubble label
  faqQuestion: 200,
  faqAnswer: 2000,
  password: 72, // bcrypt's effective ceiling
  confirmWord: 12, // "DELETE" confirmation box
} as const;

// Server-side defense: coerce to string and truncate to a max length.
export function clampLen(v: unknown, max: number): string {
  return String(v ?? "").slice(0, max);
}
