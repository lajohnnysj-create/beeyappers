"use client";

import { useState, useRef, useEffect } from "react";
import { type WidgetConfig } from "@/lib/widget-config";
import { ChatWidget } from "./chat-widget";

const SHADOW = 36; // transparent room for drop shadows
const MARGIN = 18; // gap between widget and the viewport corner
const GAP = 8; // gap between panel and the close button
const X_SIZE = 56;

// Pick a legible icon color (dark or white) for a given hex background.
function readable(bg: string): string {
  const h = bg.replace("#", "");
  if (h.length < 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.62 ? "#0f172a" : "#ffffff";
}

function ChatIcon({ fill, dot }: { fill: string; dot: string }) {
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

export function WidgetFrame({
  widgetKey,
  config,
}: {
  widgetKey: string;
  config: WidgetConfig;
}) {
  const left = config.launcherPosition === "bottom-left";
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | undefined>(undefined);
  const [vw, setVw] = useState(1280);
  const [vh, setVh] = useState(900);
  const rootRef = useRef<HTMLDivElement>(null);

  // window.innerHeight here is the IFRAME's size, not the host page's, so the
  // loader posts the real host viewport for responsive sizing.
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      const d = e.data;
      if (d && d.type === "bleviq:viewport") {
        if (typeof d.w === "number") setVw(d.w);
        if (typeof d.h === "number") setVh(d.h);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const panelW = Math.max(260, Math.min(config.panelWidth || 380, vw - 2 * MARGIN - 4));
  const panelH = Math.max(
    360,
    Math.min(config.panelHeight || 560, vh - 2 * MARGIN - GAP - X_SIZE - 4)
  );

  // Report our exact footprint to the loader so it can size the iframe.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    function post() {
      if (!el) return;
      try {
        window.parent.postMessage(
          {
            type: "bleviq:resize",
            w: Math.ceil(el.offsetWidth),
            h: Math.ceil(el.offsetHeight),
            side: left ? "left" : "right",
          },
          "*"
        );
      } catch {
        /* ignore */
      }
    }
    post();
    const ro = new ResizeObserver(post);
    ro.observe(el);
    return () => ro.disconnect();
  }, [left]);

  function openChat(q?: string) {
    if (q) setPending(q);
    setOpen(true);
  }
  function closeChat() {
    setOpen(false);
  }

  const pad = left
    ? { paddingTop: SHADOW, paddingRight: SHADOW, paddingBottom: MARGIN, paddingLeft: MARGIN }
    : { paddingTop: SHADOW, paddingLeft: SHADOW, paddingBottom: MARGIN, paddingRight: MARGIN };

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        bottom: 0,
        left: left ? 0 : "auto",
        right: left ? "auto" : 0,
        display: "flex",
        flexDirection: "column",
        alignItems: left ? "flex-start" : "flex-end",
        justifyContent: "flex-end",
        ...pad,
      }}
    >
      {/* Panel stays mounted (preserves chat history); hidden when closed. */}
      <div
        style={{
          display: open ? "block" : "none",
          width: panelW,
          height: panelH,
          marginBottom: GAP,
          borderRadius: 16,
          overflow: "hidden",
          isolation: "isolate",
          background: "transparent",
          boxShadow: "0 10px 34px rgba(0,0,0,.22)",
          transformOrigin: left ? "bottom left" : "bottom right",
          animation: "bvPop .28s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <ChatWidget
          widgetKey={widgetKey}
          config={config}
          radius={16}
          onClose={closeChat}
          pendingQuestion={pending}
          onQuestionConsumed={() => setPending(undefined)}
        />
      </div>

      {open ? (
        <button
          onClick={closeChat}
          aria-label="Close chat"
          style={{
            width: X_SIZE,
            height: X_SIZE,
            borderRadius: "50%",
            background: config.bubbleColor,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,.25)",
            fontSize: 22,
          }}
        >
          {"\u2715"}
        </button>
      ) : config.launcherStyle === "bar" ? (
        <BarLauncher config={config} left={left} onOpen={openChat} />
      ) : (
        <BubbleLauncher config={config} left={left} onOpen={() => openChat()} />
      )}

      <style>{`@keyframes bvPop{0%{opacity:0;transform:translateY(12px) scale(.94)}100%{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}

function BubbleLauncher({
  config,
  left,
  onOpen,
}: {
  config: WidgetConfig;
  left: boolean;
  onOpen: () => void;
}) {
  const btn = (
    <button
      onClick={onOpen}
      aria-label="Open chat"
      style={{
        width: 56,
        height: 56,
        borderRadius: left ? "20px 20px 20px 8px" : "20px 20px 8px 20px",
        background: config.bubbleColor,
        border: "none",
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(0,0,0,.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {config.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.avatarUrl}
          alt=""
          style={{ width: 38, height: 38, borderRadius: 13, objectFit: "cover" }}
        />
      ) : (
        <ChatIcon fill={readable(config.bubbleColor)} dot={config.bubbleColor} />
      )}
    </button>
  );

  if (!config.launcherLabel) return btn;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexDirection: left ? "row-reverse" : "row",
      }}
    >
      <span
        style={{
          background: "#fff",
          color: "#0f172a",
          padding: "8px 12px",
          borderRadius: 18,
          boxShadow: "0 4px 14px rgba(0,0,0,.18)",
          fontSize: 14,
          whiteSpace: "nowrap",
        }}
      >
        {config.launcherLabel}
      </span>
      {btn}
    </div>
  );
}

function BarLauncher({
  config,
  left,
  onOpen,
}: {
  config: WidgetConfig;
  left: boolean;
  onOpen: (q?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [val, setVal] = useState("");

  function submit() {
    const q = val.trim();
    onOpen(q || undefined);
    setVal("");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: left ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: config.bubbleColor,
          borderRadius: left ? "22px 22px 22px 8px" : "22px 22px 8px 22px",
          padding: 8,
          boxShadow: "0 6px 20px rgba(0,0,0,.22)",
        }}
      >
        {config.avatarUrl ? (
          <button
            onClick={() => onOpen()}
            aria-label="Open chat"
            style={{
              width: 36,
              height: 36,
              border: "none",
              padding: 0,
              cursor: "pointer",
              borderRadius: 12,
              background: "rgba(255,255,255,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.avatarUrl}
              alt=""
              style={{ width: 36, height: 36, borderRadius: 12, objectFit: "cover" }}
            />
          </button>
        ) : null}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            borderRadius: 9999,
            padding: "6px 6px 6px 14px",
          }}
        >
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onFocus={() => setExpanded(true)}
            onBlur={() => {
              if (!val.trim()) setExpanded(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={config.launcherLabel || "Ask AI"}
            aria-label="Ask a question"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              // 16px minimum stops iOS Safari from zooming when this field is
              // focused (it expands on tap before the panel opens).
              fontSize: 16,
              color: "#0f172a",
              width: expanded ? 210 : 74,
              boxSizing: "border-box",
              transition: "width .3s cubic-bezier(.34,1.4,.64,1)",
            }}
          />
          <button
            onClick={submit}
            aria-label="Send"
            style={{
              width: 30,
              height: 30,
              border: "none",
              padding: 0,
              cursor: "pointer",
              borderRadius: "50%",
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          background: "#fff",
          borderRadius: 9999,
          boxShadow: "0 2px 8px rgba(0,0,0,.12)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          maxHeight: expanded ? 28 : 0,
          opacity: expanded ? 1 : 0,
          transform: expanded ? "translateY(0)" : "translateY(-4px)",
          marginTop: expanded ? 8 : 0,
          padding: expanded ? "5px 12px" : "0 12px",
          transition:
            "max-height .28s ease, opacity .2s ease, transform .28s ease, margin-top .28s ease",
        }}
      >
        This chat is recorded.
      </div>
    </div>
  );
}
