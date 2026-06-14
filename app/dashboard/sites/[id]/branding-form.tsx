"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveBranding } from "./actions";
import {
  type WidgetConfig,
  FONT_OPTIONS,
  FONT_LABELS,
  resolveFont,
} from "@/lib/widget-config";

const MAX_BYTES = 1_000_000; // 1 MB
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/x-icon"];

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-slate-700">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-slate-300"
          aria-label={label}
        />
        <code className="w-16 text-xs text-slate-500">{value}</code>
      </span>
    </label>
  );
}

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

  async function upload(file: File, kind: "logo" | "favicon") {
    setMsg(null);
    if (!OK_TYPES.includes(file.type)) {
      setMsg({ error: "Use a PNG, JPG, WEBP, SVG, or ICO image." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setMsg({ error: "Image must be under 1 MB." });
      return;
    }
    const supabase = createClient();
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${userId}/${siteId}/${kind}.${ext}`;
    const { error } = await supabase.storage
      .from("widget-assets")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (error) {
      setMsg({ error: "Upload failed: " + error.message });
      return;
    }
    const { data } = supabase.storage.from("widget-assets").getPublicUrl(path);
    const url = data.publicUrl + "?v=" + Date.now();
    set(kind === "logo" ? "logoUrl" : "faviconUrl", url);
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await saveBranding(siteId, config);
    setMsg(res);
    setSaving(false);
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Editor */}
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Text</h2>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-sm text-slate-700">Assistant name</span>
              <input
                value={config.assistantName}
                onChange={(e) => set("assistantName", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Greeting message</span>
              <input
                value={config.greeting}
                onChange={(e) => set("greeting", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Images</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm text-slate-700">Logo (header)</span>
              <div className="mt-1 flex items-center gap-3">
                {config.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={config.logoUrl} alt="Logo" className="h-8 w-auto" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && upload(e.target.files[0], "logo")
                  }
                  className="text-xs"
                />
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-700">Favicon (message icon)</span>
              <div className="mt-1 flex items-center gap-3">
                {config.faviconUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.faviconUrl}
                    alt="Favicon"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && upload(e.target.files[0], "favicon")
                  }
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Colors</h2>
          <div className="mt-2 sm:grid sm:grid-cols-2 sm:gap-x-6">
            <ColorRow label="Launcher bubble" value={config.bubbleColor} onChange={(v) => set("bubbleColor", v)} />
            <ColorRow label="Header" value={config.headerColor} onChange={(v) => set("headerColor", v)} />
            <ColorRow label="Background" value={config.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
            <ColorRow label="Text" value={config.textColor} onChange={(v) => set("textColor", v)} />
            <ColorRow label="Visitor bubble" value={config.userBubbleColor} onChange={(v) => set("userBubbleColor", v)} />
            <ColorRow label="Bot bubble" value={config.assistantBubbleColor} onChange={(v) => set("assistantBubbleColor", v)} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Font</h2>
          <select
            value={config.fontFamily}
            onChange={(e) => set("fontFamily", e.target.value)}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
          >
            {Object.keys(FONT_OPTIONS).map((k) => (
              <option key={k} value={k}>
                {FONT_LABELS[k] || k}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Launcher bubble</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-700">Position</span>
              <select
                value={config.launcherPosition}
                onChange={(e) =>
                  set("launcherPosition", e.target.value as WidgetConfig["launcherPosition"])
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              >
                <option value="bottom-right">Bottom right</option>
                <option value="bottom-left">Bottom left</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Icon</span>
              <select
                value={config.launcherIcon}
                onChange={(e) =>
                  set("launcherIcon", e.target.value as WidgetConfig["launcherIcon"])
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              >
                <option value="default">Default chat icon</option>
                <option value="emoji">Emoji</option>
                <option value="favicon">Favicon image</option>
              </select>
            </label>
            {config.launcherIcon === "emoji" && (
              <label className="block">
                <span className="text-sm text-slate-700">Emoji</span>
                <input
                  value={config.launcherEmoji}
                  onChange={(e) => set("launcherEmoji", e.target.value)}
                  maxLength={4}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
                />
              </label>
            )}
            <label className="block">
              <span className="text-sm text-slate-700">Label (optional)</span>
              <input
                value={config.launcherLabel}
                onChange={(e) => set("launcherLabel", e.target.value)}
                placeholder="e.g. Chat with us"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Panel width (px)</span>
              <input
                type="number"
                value={config.panelWidth}
                onChange={(e) => set("panelWidth", Number(e.target.value) || 380)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Panel height (px)</span>
              <input
                type="number"
                value={config.panelHeight}
                onChange={(e) => set("panelHeight", Number(e.target.value) || 560)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
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
        className="grid h-14 w-14 place-items-center rounded-full text-2xl text-white shadow"
        style={{ background: config.bubbleColor }}
      >
        {config.launcherIcon === "favicon" && config.faviconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.faviconUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : config.launcherIcon === "emoji" ? (
          <span>{config.launcherEmoji || "\uD83D\uDCAC"}</span>
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
        className="flex items-center gap-2 border-b border-black/5 px-4 py-3"
        style={{ background: config.headerColor }}
      >
        {config.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.logoUrl} alt="" className="h-6 w-auto" />
        ) : null}
        <span className="text-sm font-semibold" style={{ color: config.textColor }}>
          {config.assistantName || "Assistant"}
        </span>
      </div>

      <div className="space-y-3 p-4" style={{ height: 320, overflow: "hidden" }}>
        <div className="flex items-start gap-2">
          <Avatar config={config} />
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
            Do you have a link in bio tool?
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Avatar config={config} />
          <div
            className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
            style={{ background: config.assistantBubbleColor, color: config.textColor }}
          >
            Yes! It is part of the all-in-one platform.
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

function Avatar({ config }: { config: WidgetConfig }) {
  if (config.faviconUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={config.faviconUrl}
        alt=""
        className="h-6 w-6 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white"
      style={{ background: config.bubbleColor }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
    </span>
  );
}
