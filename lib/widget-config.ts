// Shared by the dashboard editor, the embed page, and the public config API.
// No server-only imports: safe on both client and server.

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
  launcherIcon: "default" | "emoji" | "favicon";
  launcherEmoji: string;
  launcherLabel: string;
  panelWidth: number;
  panelHeight: number;
};

export const FONT_OPTIONS: Record<string, string> = {
  system:
    'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  inter: '"Inter", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  rounded: '"Nunito", "Trebuchet MS", system-ui, sans-serif',
  mono: '"SF Mono", Menlo, Consolas, monospace',
};

export const FONT_LABELS: Record<string, string> = {
  system: "System (clean sans)",
  inter: "Inter",
  serif: "Serif (Georgia)",
  rounded: "Rounded",
  mono: "Monospace",
};

export const DEFAULT_CONFIG: WidgetConfig = {
  assistantName: "Assistant",
  greeting: "Hi! Ask me anything about this site.",
  logoUrl: null,
  faviconUrl: null,
  avatarUrl: null,
  bubbleColor: "#2563eb",
  headerColor: "#ffffff",
  backgroundColor: "#ffffff",
  userBubbleColor: "#2563eb",
  assistantBubbleColor: "#f1f5f9",
  textColor: "#0f172a",
  fontFamily: "system",
  launcherPosition: "bottom-right",
  launcherIcon: "default",
  launcherEmoji: "\uD83D\uDCAC",
  launcherLabel: "",
  panelWidth: 380,
  panelHeight: 560,
};

// Merge stored (possibly partial) config over defaults.
export function mergeConfig(raw: unknown): WidgetConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<WidgetConfig>;
  return { ...DEFAULT_CONFIG, ...r };
}

export function resolveFont(key: string): string {
  return FONT_OPTIONS[key] || FONT_OPTIONS.system;
}
