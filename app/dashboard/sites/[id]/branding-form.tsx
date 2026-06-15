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
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
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
        >
          <AvatarPicker
            siteId={siteId}
            userId={userId}
            value={config.avatarUrl}
            onChange={(v) => set("avatarUrl", v)}
          />
        </Section>

        <Section icon={ICONS.chat} title="Assistant">
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

        <Section icon={ICONS.palette} title="Colors">
          <div className="space-y-2.5">
            <ColorField icon={COLOR_ICONS.accent} label="Accent" value={config.bubbleColor} onChange={(v) => set("bubbleColor", v)} />
            <ColorField icon={COLOR_ICONS.header} label="Header" value={config.headerColor} onChange={(v) => set("headerColor", v)} />
            <ColorField icon={COLOR_ICONS.background} label="Background" value={config.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
            <ColorField icon={COLOR_ICONS.visitor} label="Visitor message" value={config.userBubbleColor} onChange={(v) => set("userBubbleColor", v)} />
            <ColorField icon={COLOR_ICONS.bot} label="Bot message" value={config.assistantBubbleColor} onChange={(v) => set("assistantBubbleColor", v)} />
            <ColorField icon={COLOR_ICONS.text} label="Text" value={config.textColor} onChange={(v) => set("textColor", v)} />
          </div>
        </Section>

        <Section icon={ICONS.type} title="Font">
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

        <Section icon={ICONS.bubble} title="Chat bubble">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Position</span>
              <select
                value={config.launcherPosition}
                onChange={(e) =>
                  set("launcherPosition", e.target.value as WidgetConfig["launcherPosition"])
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              >
                <option value="bottom-right">Bottom right</option>
                <option value="bottom-left">Bottom left</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Label (optional)</span>
              <input
                value={config.launcherLabel}
                onChange={(e) => set("launcherLabel", e.target.value)}
                placeholder="e.g. Chat with us"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Panel width (px)</span>
              <input
                type="number"
                value={config.panelWidth}
                onChange={(e) => set("panelWidth", Number(e.target.value) || 380)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Panel height (px)</span>
              <input
                type="number"
                value={config.panelHeight}
                onChange={(e) => set("panelHeight", Number(e.target.value) || 560)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>
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
        <p className="mb-2 text-xs font-medium text-slate-500">Live preview</p>
        <LauncherPreview config={config} />
        <Preview config={config} />
      </div>
    </div>
  );
}

/* ---------------- previews ---------------- */
function AgentAvatar({
  config,
  size,
}: {
  config: WidgetConfig;
  size: number;
}) {
  const px = { width: size, height: size };
  if (config.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={config.avatarUrl}
        alt=""
        style={px}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-white"
      style={{ ...px, background: config.bubbleColor }}
    >
      <span className="h-1/3 w-1/3 rounded-full bg-white" />
    </span>
  );
}

function LauncherPreview({ config }: { config: WidgetConfig }) {
  const left = config.launcherPosition === "bottom-left";
  return (
    <div
      className="mb-4 flex items-center gap-2"
      style={{
        justifyContent: left ? "flex-start" : "flex-end",
        flexDirection: left ? "row-reverse" : "row",
      }}
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
        className="grid h-14 w-14 place-items-center overflow-hidden rounded-full text-2xl text-white shadow"
        style={{ background: config.bubbleColor }}
      >
        {config.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{"\uD83D\uDCAC"}</span>
        )}
      </span>
    </div>
  );
}

function Preview({ config }: { config: WidgetConfig }) {
  const font = resolveFont(config.fontFamily);
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
      style={{ background: config.backgroundColor, fontFamily: font, height: 460 }}
    >
      <div
        className="flex items-center gap-2.5 border-b border-black/5 px-4 py-3"
        style={{ background: config.headerColor }}
      >
        <AgentAvatar config={config} size={32} />
        <span className="text-sm font-semibold" style={{ color: config.textColor }}>
          {config.assistantName || "Assistant"}
        </span>
      </div>

      <div className="space-y-3 p-4" style={{ height: 320, overflow: "hidden" }}>
        <div className="flex items-start gap-2">
          <AgentAvatar config={config} size={24} />
          <div
            className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
            style={{ background: config.assistantBubbleColor, color: config.textColor }}
          >
            {config.greeting || "Hi! Ask me anything."}
          </div>
        </div>
        <div className="flex justify-end">
          <div
            className="max-w-[80%] rounded-2xl px-3 py-2 text-sm text-white"
            style={{ background: config.userBubbleColor }}
          >
            Do you offer refunds?
          </div>
        </div>
        <div className="flex items-start gap-2">
          <AgentAvatar config={config} size={24} />
          <div
            className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
            style={{ background: config.assistantBubbleColor, color: config.textColor }}
          >
            Yes, within 30 days of purchase.
          </div>
        </div>
      </div>

      <div className="border-t border-black/5 p-3">
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-400">
            Type your question...
          </div>
          <div
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ background: config.bubbleColor }}
          >
            Send
          </div>
        </div>
      </div>
    </div>
  );
}
