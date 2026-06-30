"use client";

import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { saveBranding } from "./actions";
import { AvatarUploader } from "./avatar-uploader";
import { FIELD_LIMITS } from "@/lib/field-limits";
import {
  type WidgetConfig,
  FONTS,
  resolveFont,
  googleFontsHref,
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
            "shrink-0 text-slate-500 transition-transform " +
            (isOpen ? "rotate-180" : "")
          }
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" {...(isOpen ? {} : { inert: true })}>
          <div
            className={
              "border-t border-slate-100 px-6 py-5 transition-opacity duration-200 " +
              (isOpen ? "opacity-100 delay-100" : "opacity-0")
            }
          >
            {children}
          </div>
        </div>
      </div>
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
      aria-pressed={selected}
      className={
        "relative aspect-square overflow-hidden rounded-lg border transition " +
        (selected
          ? "border-brand-500 ring-2 ring-brand-200"
          : "border-slate-200 hover:border-slate-300")
      }
    >
      {err ? (
        <span className="grid h-full w-full place-items-center bg-slate-100 text-xs text-slate-600">
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
          "grid aspect-square place-items-center rounded-lg border text-xs font-medium text-slate-600 transition " +
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
  open,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const v = value.toLowerCase();
  const isPreset = PRESET_COLORS.includes(v);

  // HEX is the most-reached-for format, so surface a text field right here and
  // people never need the OS color palette. Keep a local draft so partial
  // typing ("#b91") isn't reformatted mid-keystroke; commit only a valid 3- or
  // 6-digit hex. Re-sync when the value changes elsewhere (e.g. preset clicks).
  const [hexDraft, setHexDraft] = useState(value);
  useEffect(() => setHexDraft(value), [value]);

  function commitHex(raw: string) {
    let h = raw.trim();
    if (!h.startsWith("#")) h = "#" + h;
    if (/^#[0-9a-fA-F]{3}$/.test(h)) {
      h = "#" + h.slice(1).split("").map((c) => c + c).join("");
    }
    if (/^#[0-9a-fA-F]{6}$/.test(h)) onChange(h.toLowerCase());
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
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
              "text-slate-500 transition-transform " + (open ? "rotate-180" : "")
            }
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" {...(open ? {} : { inert: true })}>
          <div
            className={
              "border-t border-slate-100 px-4 py-3 transition-opacity duration-200 " +
              (open ? "opacity-100 delay-100" : "opacity-0")
            }
          >
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => {
                const active = v === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    aria-label={c}
                    aria-pressed={active}
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

            {/* HEX is the primary control; the swatch opens the OS picker for
                anyone who wants it. */}
            <div className="mt-3 flex items-center gap-2">
              <label
                className={
                  "relative inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition " +
                  (!isPreset
                    ? "border-brand-500"
                    : "border-slate-300 hover:bg-slate-50")
                }
                aria-label="Open color picker"
                title="Open color picker"
              >
                <span
                  className="h-5 w-5 rounded border border-slate-300"
                  style={{ background: value }}
                />
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <input
                type="text"
                value={hexDraft}
                onChange={(e) => {
                  setHexDraft(e.target.value);
                  commitHex(e.target.value);
                }}
                spellCheck={false}
                maxLength={7}
                aria-label={`${label} hex value`}
                placeholder="#000000"
                className="w-28 rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- main form ---------------- */
export function BrandingForm({
  siteId,
  userId,
  initialConfig,
  canRemoveBranding,
}: {
  siteId: string;
  userId: string;
  initialConfig: WidgetConfig;
  canRemoveBranding: boolean;
}) {
  const [config, setConfig] = useState<WidgetConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);

  // Removing the "Powered by Bleviq" badge is a paid feature. Non-paying
  // accounts always show it, regardless of their saved setting. The widget
  // enforces this server-side too; this just keeps the UI honest.
  const brandingShown = canRemoveBranding ? config.showBranding : true;
  const previewConfig = canRemoveBranding
    ? config
    : { ...config, showBranding: true };

  function set<K extends keyof WidgetConfig>(key: K, val: WidgetConfig[K]) {
    setConfig((c) => ({ ...c, [key]: val }));
  }

  // Accordion: at most one section open at a time.
  const [openId, setOpenId] = useState<string>("avatar");
  const sectionProps = (id: string) => ({
    isOpen: openId === id,
    onToggle: () => setOpenId((cur) => (cur === id ? "" : id)),
  });

  // Accordion: at most one color picker open at a time within Colors.
  const [openColor, setOpenColor] = useState<string>("");
  const colorProps = (id: string) => ({
    open: openColor === id,
    onToggle: () => setOpenColor((cur) => (cur === id ? "" : id)),
  });

  // Auto-dismiss the save confirmation (or error) after a few seconds.
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

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
      <div className="space-y-4">
        <Section
          icon={ICONS.avatar}
          title="Avatar"
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
                maxLength={FIELD_LIMITS.assistantName}
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
                maxLength={FIELD_LIMITS.greeting}
                className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>
        </Section>

        <Section icon={ICONS.palette} title="Colors" {...sectionProps("colors")}>
          <div className="space-y-2.5">
            <ColorField icon={COLOR_ICONS.accent} label="Accent" value={config.bubbleColor} onChange={(v) => set("bubbleColor", v)} {...colorProps("accent")} />
            <ColorField icon={COLOR_ICONS.header} label="Header" value={config.headerColor} onChange={(v) => set("headerColor", v)} {...colorProps("header")} />
            <ColorField icon={COLOR_ICONS.background} label="Background" value={config.backgroundColor} onChange={(v) => set("backgroundColor", v)} {...colorProps("background")} />
            <ColorField icon={COLOR_ICONS.visitor} label="Visitor message" value={config.userBubbleColor} onChange={(v) => set("userBubbleColor", v)} {...colorProps("visitor")} />
            <ColorField icon={COLOR_ICONS.bot} label="AI message" value={config.assistantBubbleColor} onChange={(v) => set("assistantBubbleColor", v)} {...colorProps("bot")} />
            <ColorField icon={COLOR_ICONS.text} label="Text" value={config.textColor} onChange={(v) => set("textColor", v)} {...colorProps("text")} />
          </div>
        </Section>

        <Section icon={ICONS.type} title="Font" {...sectionProps("font")}>
          <FontSelect
            value={config.fontFamily}
            onChange={(k) => set("fontFamily", k)}
          />
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
                      aria-pressed={active}
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
                maxLength={FIELD_LIMITS.launcherLabel}
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
              {!canRemoveBranding && (
                <p className="mt-1 text-xs font-medium text-brand-600">
                  Upgrade to remove Bleviq branding.
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={brandingShown}
              aria-label="Bleviq branding"
              disabled={!canRemoveBranding}
              title={
                canRemoveBranding
                  ? undefined
                  : "Upgrade to remove Bleviq branding"
              }
              onClick={() => {
                if (canRemoveBranding) set("showBranding", !config.showBranding);
              }}
              className={
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition " +
                (brandingShown ? "bg-brand-600" : "bg-slate-300") +
                (canRemoveBranding ? "" : " cursor-not-allowed opacity-60")
              }
            >
              <span
                className={
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition " +
                  (brandingShown ? "translate-x-[22px]" : "translate-x-0.5")
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
          {msg?.ok && <span role="status" className="text-sm text-brand-700">{msg.ok}</span>}
          {msg?.error && <span role="alert" className="text-sm text-red-600">{msg.error}</span>}
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-center text-xs font-medium text-slate-600">Live preview</p>
        <LauncherPreview config={config} />
        <Preview config={previewConfig} />
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
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
        className="grid place-items-center text-white shadow-lg"
        style={{
          width: 72,
          height: 72,
          background: config.bubbleColor,
          borderRadius: left ? "24px 24px 24px 10px" : "24px 24px 10px 24px",
        }}
      >
        {config.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.avatarUrl}
            alt=""
            style={{ width: 50, height: 50, borderRadius: 16, objectFit: "cover" }}
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

/* ---------------- font dropdown ---------------- */
// Custom listbox so each option (and the trigger) renders in its own typeface.
// The popover is portaled to <body> because the section's expand animation
// clips with overflow-hidden, which would crop a normal absolute dropdown.
function FontSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = Math.max(0, FONTS.findIndex((f) => f.key === value));
  const current = FONTS[selectedIndex] ?? FONTS[0];

  // Load every Google font once so the list + preview show their real face.
  useEffect(() => {
    const href = googleFontsHref();
    if (!href || typeof document === "undefined") return;
    if (document.getElementById("bv-all-fonts")) return;
    const link = document.createElement("link");
    link.id = "bv-all-fonts";
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, []);

  // Position the portaled popover under the trigger; track scroll/resize.
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setRect({ top: r.bottom + 6, left: r.left, width: r.width });
    };
    place();
    optRefs.current[selectedIndex]?.focus();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, selectedIndex]);

  // Close on click outside the trigger and the (portaled) list.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = (k: string) => {
    onChange(k);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onListKeyDown = (e: ReactKeyboardEvent<HTMLUListElement>) => {
    const i = optRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      optRefs.current[Math.min(FONTS.length - 1, i + 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      optRefs.current[Math.max(0, i - 1)]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      optRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      optRefs.current[FONTS.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-left text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      >
        <span style={{ fontFamily: resolveFont(current.key) }}>{current.label}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open &&
        rect &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Font"
            onKeyDown={onListKeyDown}
            style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width }}
            className="z-50 max-h-72 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {FONTS.map((f, i) => {
              const active = f.key === value;
              return (
                <li key={f.key} role="option" aria-selected={active}>
                  <button
                    ref={(el) => {
                      optRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => choose(f.key)}
                    className={
                      "flex w-full items-center justify-between px-3 py-2 text-left text-[15px] outline-none transition hover:bg-slate-50 focus:bg-brand-50 " +
                      (active ? "bg-brand-50 text-brand-700" : "text-slate-800")
                    }
                    style={{ fontFamily: resolveFont(f.key) }}
                  >
                    <span>{f.label}</span>
                    {active && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}

function Preview({ config }: { config: WidgetConfig }) {
  const font = resolveFont(config.fontFamily);
  const headerFg = readable(config.headerColor);
  const panelIsDark = readable(config.backgroundColor) === "#ffffff";
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
      style={{ background: config.backgroundColor, fontFamily: font, height: 560 }}
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
          <span className="flex-1 text-sm text-slate-600">Type here...</span>
          <span className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: config.bubbleColor }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
        </div>
      </div>

      <div className="px-4 pb-2.5 pt-1.5" style={{ color: panelIsDark ? "rgba(255,255,255,0.6)" : "#64748b" }}>
        <p className="m-0 text-center text-[10px] leading-snug">
          You&rsquo;re chatting with an AI. Messages may be stored. Please
          don&rsquo;t share sensitive personal information. By continuing, you
          agree to our{" "}
          <a
            href="https://www.bleviq.com/ai-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "inherit" }}
          >
            AI Terms
          </a>
          .
        </p>
        {config.showBranding && (
          <span className="mt-1 flex items-center justify-center gap-0.5">
            <span className="text-[10px]">Powered by</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={panelIsDark ? "/logowhite-small.png" : "/logoblack-small.png"} alt="Bleviq" className="h-3 w-auto" />
          </span>
        )}
      </div>
    </div>
  );
}
