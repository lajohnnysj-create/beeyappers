// Shared by the dashboard editor, the embed page, and the public config API.
// No server-only imports: safe on both client and server.

import { FIELD_LIMITS, clampLen } from "./field-limits";

export type WidgetConfig = {
  assistantName: string;
  greeting: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  avatarUrl: string | null; // agent photo: bubble, header, message avatars
  bubbleColor: string; // launcher button + accents
  headerColor: string; // chatbox header background
  backgroundColor: string; // chat panel background
  userBubbleColor: string; // visitor message bubble
  assistantBubbleColor: string; // bot message bubble
  textColor: string; // primary text in the panel
  fontFamily: string; // a key from FONT_OPTIONS
  // Launcher bubble (rendered on the host site by widget.js)
  launcherPosition: "bottom-right" | "bottom-left";
  launcherStyle: "bubble" | "bar";
  launcherIcon: "default" | "emoji" | "favicon";
  launcherEmoji: string;
  launcherLabel: string;
  panelWidth: number;
  panelHeight: number;
  showBranding: boolean; // show the "Powered by Bleviq" badge in the widget
};

// Font catalog (single source of truth for editor, embed, and config API).
// `google` is the family spec for the Google Fonts CSS2 API (spaces as "+").
// Omit `google` for faces already present on every device (web-safe).
export type FontDef = { key: string; label: string; stack: string; google?: string };

const SANS = "system-ui, sans-serif";
const SERIF = 'Georgia, "Times New Roman", serif';

export const FONTS: FontDef[] = [
  { key: "system", label: "System", stack: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { key: "inter", label: "Inter", stack: `"Inter", ${SANS}`, google: "Inter:wght@400;500;600;700" },
  { key: "poppins", label: "Poppins", stack: `"Poppins", ${SANS}`, google: "Poppins:wght@400;500;600;700" },
  { key: "montserrat", label: "Montserrat", stack: `"Montserrat", ${SANS}`, google: "Montserrat:wght@400;500;600;700" },
  { key: "roboto", label: "Roboto", stack: `"Roboto", ${SANS}`, google: "Roboto:wght@400;500;700" },
  { key: "opensans", label: "Open Sans", stack: `"Open Sans", ${SANS}`, google: "Open+Sans:wght@400;500;600;700" },
  { key: "lato", label: "Lato", stack: `"Lato", ${SANS}`, google: "Lato:wght@400;700" },
  { key: "worksans", label: "Work Sans", stack: `"Work Sans", ${SANS}`, google: "Work+Sans:wght@400;500;600;700" },
  { key: "dmsans", label: "DM Sans", stack: `"DM Sans", ${SANS}`, google: "DM+Sans:wght@400;500;600;700" },
  { key: "jakarta", label: "Plus Jakarta Sans", stack: `"Plus Jakarta Sans", ${SANS}`, google: "Plus+Jakarta+Sans:wght@400;500;600;700" },
  { key: "manrope", label: "Manrope", stack: `"Manrope", ${SANS}`, google: "Manrope:wght@400;500;600;700" },
  { key: "rounded", label: "Nunito", stack: `"Nunito", "Trebuchet MS", ${SANS}`, google: "Nunito:wght@400;500;600;700" },
  { key: "quicksand", label: "Quicksand", stack: `"Quicksand", ${SANS}`, google: "Quicksand:wght@400;500;600;700" },
  { key: "spacegrotesk", label: "Space Grotesk", stack: `"Space Grotesk", ${SANS}`, google: "Space+Grotesk:wght@400;500;600;700" },
  { key: "merriweather", label: "Merriweather", stack: `"Merriweather", ${SERIF}`, google: "Merriweather:wght@400;700" },
  { key: "playfair", label: "Playfair Display", stack: `"Playfair Display", ${SERIF}`, google: "Playfair+Display:wght@400;500;600;700" },
  { key: "lora", label: "Lora", stack: `"Lora", ${SERIF}`, google: "Lora:wght@400;500;600;700" },
  { key: "fraunces", label: "Fraunces", stack: `"Fraunces", ${SERIF}`, google: "Fraunces:wght@400;500;600;700" },
  { key: "serif", label: "Georgia", stack: SERIF },
  { key: "mono", label: "Monospace", stack: '"SF Mono", Menlo, Consolas, monospace' },
];

export const FONT_OPTIONS: Record<string, string> = Object.fromEntries(
  FONTS.map((f) => [f.key, f.stack]),
);

export const FONT_LABELS: Record<string, string> = Object.fromEntries(
  FONTS.map((f) => [f.key, f.label]),
);

export const DEFAULT_CONFIG: WidgetConfig = {
  assistantName: "Assistant",
  greeting: "Hi! Ask me anything about this site.",
  logoUrl: null,
  faviconUrl: null,
  avatarUrl: "/agent/1.webp",
  bubbleColor: "#2563eb",
  headerColor: "#ffffff",
  backgroundColor: "#ffffff",
  userBubbleColor: "#2563eb",
  assistantBubbleColor: "#f1f5f9",
  textColor: "#0f172a",
  fontFamily: "system",
  launcherPosition: "bottom-right",
  launcherStyle: "bubble",
  launcherIcon: "default",
  launcherEmoji: "\uD83D\uDCAC",
  launcherLabel: "",
  panelWidth: 380,
  panelHeight: 560,
  showBranding: true,
};

// Fixed UI chrome shown in the widget. Localized alongside the greeting at
// frame-render time; these defaults are the English source.
export type WidgetLabels = {
  placeholder: string;
  send: string;
  poweredBy: string;
  askAI: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadSubmit: string;
  leadSent: string;
  leadError: string;
};

export const DEFAULT_LABELS: WidgetLabels = {
  placeholder: "Type here...",
  send: "Send",
  poweredBy: "Powered by",
  askAI: "Ask AI",
  leadName: "Name",
  leadEmail: "Email",
  leadPhone: "Phone",
  leadSubmit: "Submit",
  leadSent: "Thanks! We'll be in touch soon.",
  leadError: "Please check your details.",
};

// Merge stored (possibly partial) config over defaults.
export function mergeConfig(raw: unknown): WidgetConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<WidgetConfig>;
  const merged = { ...DEFAULT_CONFIG, ...r };
  // Defense in depth: cap user-entered text so an oversized value (one that
  // bypassed the dashboard's maxLength) can't bloat storage or break the
  // widget's layout.
  merged.assistantName = clampLen(merged.assistantName, FIELD_LIMITS.assistantName);
  merged.greeting = clampLen(merged.greeting, FIELD_LIMITS.greeting);
  merged.launcherLabel = clampLen(merged.launcherLabel, FIELD_LIMITS.launcherLabel);
  return merged;
}

export function resolveFont(key: string): string {
  return FONT_OPTIONS[key] || FONT_OPTIONS.system;
}

// Builds a Google Fonts CSS2 <link> href for the given font keys.
// With no argument, returns a link covering every catalog font (used by the
// editor so the dropdown + preview can render each face). Returns null when
// none of the keys map to a Google font (all web-safe).
export function googleFontsHref(keys?: string[]): string | null {
  const list = keys ?? FONTS.map((f) => f.key);
  const specs = Array.from(
    new Set(
      list
        .map((k) => FONTS.find((f) => f.key === k)?.google)
        .filter((g): g is string => Boolean(g)),
    ),
  );
  if (specs.length === 0) return null;
  return (
    "https://fonts.googleapis.com/css2?" +
    specs.map((s) => "family=" + s).join("&") +
    "&display=swap"
  );
}
