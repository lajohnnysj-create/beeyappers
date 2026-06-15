"use client";

import { useState, type ReactNode } from "react";
import { saveBranding } from "./actions";
import { AvatarUploader } from "./avatar-uploader";
import {
  type WidgetConfig,
  FONT_OPTIONS,
  FONT_LABELS,
  resolveFont,
} from "@/lib/widget-config";

const AGENTS = Array.from({ length: 10 }, (_, i) => `/agent/${i + 1}.webp`);

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#64748b", "#0f172a", "#ffffff",
];

/* ---------------- icons ---------------- */
const ICONS = {
  avatar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
    </svg>
  ),
  palette: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1.5" />
      <circle cx="17.5" cy="10.5" r="1.5" />
      <circle cx="8.5" cy="7.5" r="1.5" />
      <circle cx="6.5" cy="12.5" r="1.5" />
      <path d="M12 2a10 10 0 1 0 0 20 2 2 0 0 0 2-2c0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2a1.5 1.5 0 0 1 1.5-1.5H17a4 4 0 0 0 4-4 9 9 0 0 0-9-9Z" />
    </svg>
  ),
  type: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V5h16v2M9 19h6M12 5v14" />
    </svg>
  ),
  bubble: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 13a4 4 0 0 0 8 0" />
    </svg>
  ),
};

const COLOR_ICONS: Record<string, ReactNode> = {
  accent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3Z" />
    </svg>
  ),
  header: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
    </svg>
  ),
  background: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  visitor: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
    </svg>
  ),
  bot: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 8V4M9 13h.01M15 13h.01" />
    </svg>
  ),
  text: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V5h16v2M9 19h6M12 5v14" />
    </svg>
  ),
};

function Section({
  icon,
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 px-6 py-5 text-left transition hover:bg-slate-50/60"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            "shrink-0 text-slate-400 transition-transform " +
            (isOpen ? "rotate-180" : "")
          }
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 px-6 py-5">{children}</div>
      )}
    </section>
  );
}

/* ---------------- avatar picker ---------------- */
function AvatarChoice({
  src,
  index,
  selected,
  onSelect,
}: {
  src: string;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const [err, setErr] = useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "relative aspect-square overflow-hidden rounded-lg border transition " +
        (selected
          ? "border-brand-500 ring-2 ring-brand-200"
          : "border-slate-200 hover:border-slate-300")
      }
    >
      {err ? (
        <span className="grid h-full w-full place-items-center bg-slate-100 text-xs text-slate-400">
          {index}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={"Agent " + index}
          onError={() => setErr(true)}
          className="h-full w-full object-cover"
        />
      )}
      {selected && (
        <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-white">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 6" />
          </svg>
        </span>
      )}
    </button>
  );
}

function AvatarPicker({
  siteId,
  userId,
  value,
  onChange,
}: {
  siteId: string;
  userId: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const isCustom = !!value && !AGENTS.includes(value);
  return (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-6">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={
          "grid aspect-square place-items-center rounded-lg border text-xs font-medium text-slate-400 transition " +
          (!value
            ? "border-brand-500 ring-2 ring-brand-200"
            : "border-slate-200 hover:border-slate-300")
        }
      >
        None
      </button>
      {AGENTS.map((src, i) => (
        <AvatarChoice
          key={src}
          src={src}
          index={i + 1}
          selected={value === src}
          onSelect={() => onChange(src)}
        />
      ))}
      <AvatarUploader
        siteId={siteId}
        userId={userId}
        value={value}
        isCustom={isCustom}
        onChange={(url) => onChange(url)}
      />
    </div>
  );
}

/* ---------------- color field ---------------- */
function ColorField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const v = value.toLowerCase();
  const isPreset = PRESET_COLORS.includes(v);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
      >
        <span className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500">
            {icon}
          </span>
          <span className="text-sm font-medium text-slate-800">{label}</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-6 w-6 rounded-md border border-slate-200"
            style={{ background: value }}
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={
              "text-slate-400 transition-transform " + (open ? "rotate-180" : "")
            }
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => {
              const active = v === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange(c)}
                  aria-label={c}
                  className={
                    "h-8 w-8 rounded-lg border transition " +
                    (active
                      ? "border-slate-900 ring-2 ring-brand-500"
                      : "border-slate-200 hover:border-slate-400")
                  }
                  style={{ background: c }}
                />
              );
            })}
          </div>
          <label
            className={
              "relative mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition " +
              (!isPreset
                ? "border-brand-500 text-brand-700"
                : "border-slate-300 text-slate-700 hover:bg-slate-50")
            }
          >
            <span
              className="h-4 w-4 rounded border border-slate-300"
              style={{ background: value }}
            />
            Custom
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      )}
    </div>
  );
}

/* ---------------- main form ---------------- */
export function BrandingForm({
  siteId,
  userId,
  initialConfig,
}: {
  siteId: string;
  userId: string;
  initialConfig: WidgetConfig;
}) {
  const [config, setConfig] = useState<WidgetConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);

  function set<K extends keyof WidgetConfig>(key: K, val: WidgetConfig[K]) {
    setConfig((c) => ({ ...c, [key]: val }));
  }

  // Accordion: at most one section open at a time.
  const [openId, setOpenId] = useState<string>("avatar");
  const sectionProps = (id: string) => ({
    isOpen: openId === id,
    onToggle: () => setOpenId((cur) => (cur === id ? "" : id)),
  });

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await saveBranding(siteId, config);
    setMsg(res);
    setSaving(false);
  }

  return (
    <div className="mt-2 grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Editor */}
      <div className="space-y-6">
        <Section
          icon={ICONS.avatar}
          title="Avatar"
          subtitle="Shown on the chat bubble, the header, and each reply."
          {...sectionProps("avatar")}
        >
          <AvatarPicker
            siteId={siteId}
            userId={userId}
            value={config.avatarUrl}
            onChange={(v) => set("avatarUrl", v)}
          />
        </Section>

        <Section icon={ICONS.chat} title="Assistant" {...sectionProps("assistant")}>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                AI assistant name
              </span>
              <input
                value={config.assistantName}
                onChange={(e) => set("assistantName", e.target.value)}
                placeholder="Assistant"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Greeting message
              </span>
              <textarea
                value={config.greeting}
                onChange={(e) => set("greeting", e.target.value)}
                rows={5}
                placeholder="Hi! Ask me anything about this site."
                className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>
        </Section>

        <Section icon={ICONS.palette} title="Colors" {...sectionProps("colors")}>
          <div className="space-y-2.5">
            <ColorField icon={COLOR_ICONS.accent} label="Accent" value={config.bubbleColor} onChange={(v) => set("bubbleColor", v)} />
            <ColorField icon={COLOR_ICONS.header} label="Header" value={config.headerColor} onChange={(v) => set("headerColor", v)} />
            <ColorField icon={COLOR_ICONS.background} label="Background" value={config.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
            <ColorField icon={COLOR_ICONS.visitor} label="Visitor message" value={config.userBubbleColor} onChange={(v) => set("userBubbleColor", v)} />
            <ColorField icon={COLOR_ICONS.bot} label="Bot message" value={config.assistantBubbleColor} onChange={(v) => set("assistantBubbleColor", v)} />
            <ColorField icon={COLOR_ICONS.text} label="Text" value={config.textColor} onChange={(v) => set("textColor", v)} />
          </div>
        </Section>

        <Section icon={ICONS.type} title="Font" {...sectionProps("font")}>
          <select
            value={config.fontFamily}
            onChange={(e) => set("fontFamily", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          >
            {Object.keys(FONT_OPTIONS).map((k) => (
              <option key={k} value={k}>
                {FONT_LABELS[k] || k}
              </option>
            ))}
          </select>
        </Section>

        <Section icon={ICONS.bubble} title="Chat bubble" {...sectionProps("bubble")}>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-slate-700">Style</span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(["bubble", "bar"] as const).map((s) => {
                  const active = config.launcherStyle === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("launcherStyle", s)}
                      className={
                        "flex flex-col items-center gap-2 rounded-xl border p-3 transition " +
                        (active
                          ? "border-brand-500 bg-brand-50/40 ring-2 ring-brand-200"
                          : "border-slate-200 hover:border-slate-300")
                      }
                    >
                      {s === "bubble" ? (
                        <BubbleStyleIcon active={active} />
                      ) : (
                        <BarStyleIcon active={active} />
                      )}
                      <span
                        className={
                          "text-xs font-medium " +
                          (active ? "text-brand-700" : "text-slate-600")
                        }
                      >
                        {s === "bubble" ? "Bubble" : "Chat bar"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-700">Position</span>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:max-w-xs">
                {(["bottom-left", "bottom-right"] as const).map((pos) => {
                  const active = config.launcherPosition === pos;
                  const left = pos === "bottom-left";
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => set("launcherPosition", pos)}
                      className={
                        "flex flex-col items-center gap-2 rounded-xl border p-3 transition " +
                        (active
                          ? "border-brand-500 bg-brand-50/40 ring-2 ring-brand-200"
                          : "border-slate-200 hover:border-slate-300")
                      }
                    >
                      <svg width="72" height="48" viewBox="0 0 72 48" fill="none">
                        <rect
                          x="1.5"
                          y="1.5"
                          width="69"
                          height="45"
                          rx="5"
                          className="fill-slate-100 stroke-slate-300"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={left ? 14 : 58}
                          cy={37}
                          r="7"
                          className={active ? "fill-brand-600" : "fill-slate-400"}
                        />
                      </svg>
                      <span
                        className={
                          "text-xs font-medium " +
                          (active ? "text-brand-700" : "text-slate-600")
                        }
                      >
                        {left ? "Bottom left" : "Bottom right"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Label (optional)</span>
              <input
                value={config.launcherLabel}
                onChange={(e) => set("launcherLabel", e.target.value)}
                placeholder="e.g. Chat with us"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>
          </div>
        </Section>

        <Section
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          }
          title="Settings"
          {...sectionProps("settings")}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">Bleviq branding</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Show a small &ldquo;Powered by Bleviq&rdquo; badge in your widget.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.showBranding}
              aria-label="Bleviq branding"
              onClick={() => set("showBranding", !config.showBranding)}
              className={
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition " +
                (config.showBranding ? "bg-brand-600" : "bg-slate-300")
              }
            >
              <span
                className={
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition " +
                  (config.showBranding ? "translate-x-[22px]" : "translate-x-0.5")
                }
              />
            </button>
          </div>
        </Section>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 active:scale-[.98] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {msg?.ok && <span className="text-sm text-brand-700">{msg.ok}</span>}
          {msg?.error && <span className="text-sm text-red-600">{msg.error}</span>}
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-center text-xs font-medium text-slate-500">Live preview</p>
        <LauncherPreview config={config} />
        <Preview config={config} />
      </div>
    </div>
  );
}

/* ---------------- previews ---------------- */
function readable(bg: string): string {
  const h = bg.replace("#", "");
  if (h.length < 6) return "#0f172a";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.62 ? "#0f172a" : "#ffffff";
}

function AgentAvatar({
  config,
  size,
}: {
  config: WidgetConfig;
  size: number;
}) {
  const radius = Math.round(size * 0.32);
  if (!config.avatarUrl) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={config.avatarUrl}
      alt=""
      style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", flexShrink: 0 }}
    />
  );
}

function PreviewChatIcon({ fill, dot }: { fill: string; dot: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6l-5 4v-4H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"
        fill={fill}
      />
      <circle cx="8" cy="10" r="1.4" fill={dot} />
      <circle cx="12" cy="10" r="1.4" fill={dot} />
      <circle cx="16" cy="10" r="1.4" fill={dot} />
    </svg>
  );
}

function LauncherPreview({ config }: { config: WidgetConfig }) {
  const left = config.launcherPosition === "bottom-left";
  return (
    <div
      className="mb-4 flex"
      style={{ justifyContent: left ? "flex-start" : "flex-end" }}
    >
      {config.launcherStyle === "bar" ? (
        <BarLauncher config={config} left={left} />
      ) : (
        <BubbleLauncher config={config} left={left} />
      )}
    </div>
  );
}

function BubbleLauncher({ config, left }: { config: WidgetConfig; left: boolean }) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ flexDirection: left ? "row-reverse" : "row" }}
    >
      {config.launcherLabel ? (
        <span
          className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          style={{ whiteSpace: "nowrap" }}
        >
          {config.launcherLabel}
        </span>
      ) : null}
      <span
        className="grid h-14 w-14 place-items-center text-white shadow-lg"
        style={{
          background: config.bubbleColor,
          borderRadius: left ? "20px 20px 20px 8px" : "20px 20px 8px 20px",
        }}
      >
        {config.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.avatarUrl}
            alt=""
            className="h-9 w-9 rounded-[13px] object-cover"
          />
        ) : (
          <PreviewChatIcon fill={readable(config.bubbleColor)} dot={config.bubbleColor} />
        )}
      </span>
    </div>
  );
}

function BarLauncher({ config, left }: { config: WidgetConfig; left: boolean }) {
  return (
    <div
      className="flex items-center gap-2 p-2 shadow-lg"
      style={{
        background: config.bubbleColor,
        borderRadius: left ? "22px 22px 22px 8px" : "22px 22px 8px 22px",
      }}
    >
      {config.avatarUrl ? (
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-white/20 text-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.avatarUrl}
            alt=""
            className="h-full w-full rounded-[13px] object-cover"
          />
        </span>
      ) : null}
      <span className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-3.5 pr-1.5">
        <span
          className="text-sm text-slate-500"
          style={{ whiteSpace: "nowrap" }}
        >
          {config.launcherLabel || "Ask AI"}
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </span>
      </span>
    </div>
  );
}

function BubbleStyleIcon({ active }: { active: boolean }) {
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
      <rect x="22" y="6" width="28" height="28" rx="9" className={active ? "fill-brand-600" : "fill-slate-400"} />
    </svg>
  );
}

function BarStyleIcon({ active }: { active: boolean }) {
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
      <rect x="6" y="11" width="60" height="18" rx="9" className={active ? "fill-brand-600" : "fill-slate-400"} />
      <circle cx="16" cy="20" r="4.5" className="fill-white" />
      <rect x="24" y="16.5" width="26" height="7" rx="3.5" className="fill-white" />
      <circle cx="58" cy="20" r="4.5" className="fill-slate-900" />
    </svg>
  );
}

function Preview({ config }: { config: WidgetConfig }) {
  const font = resolveFont(config.fontFamily);
  const headerFg = readable(config.headerColor);
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
      style={{ background: config.backgroundColor, fontFamily: font, height: 480 }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ background: config.headerColor }}
      >
        <AgentAvatar config={config} size={34} />
        <span className="flex-1 text-sm font-bold" style={{ color: headerFg }}>
          {config.assistantName || "Assistant"}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={headerFg} strokeWidth="2.2" strokeLinecap="round" style={{ opacity: 0.85 }}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </div>

      <div className="flex-1 space-y-3 overflow-hidden p-4">
        <div className="flex items-end gap-2">
          <AgentAvatar config={config} size={24} />
          <div
            className="max-w-[82%] px-3 py-2 text-sm"
            style={{ background: config.assistantBubbleColor, color: config.textColor, borderRadius: 16, borderBottomLeftRadius: 5 }}
          >
            {config.greeting || "Hi! Ask me anything."}
          </div>
        </div>
        <div className="flex justify-end">
          <div
            className="max-w-[82%] px-3 py-2 text-sm text-white"
            style={{ background: config.userBubbleColor, borderRadius: 16, borderBottomRightRadius: 5 }}
          >
            Do you offer refunds?
          </div>
        </div>
        <div className="flex items-end gap-2">
          <AgentAvatar config={config} size={24} />
          <div
            className="max-w-[82%] px-3 py-2 text-sm"
            style={{ background: config.assistantBubbleColor, color: config.textColor, borderRadius: 16, borderBottomLeftRadius: 5 }}
          >
            Yes, within 30 days of purchase.
          </div>
        </div>
      </div>

      <div className="px-3 pt-2">
        <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5" style={{ background: "#f1f5f9" }}>
          <span className="flex-1 text-sm text-slate-400">Type here...</span>
          <span className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: config.bubbleColor }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-2.5 pt-1.5 text-[11px]" style={{ color: "#64748b" }}>
        <span>This chat is recorded.</span>
        {config.showBranding && (
          <span className="flex items-center gap-0.5">
            <span className="text-[10px]">Powered by</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Bleviq" className="h-3 w-auto" />
          </span>
        )}
      </div>
    </div>
  );
}
