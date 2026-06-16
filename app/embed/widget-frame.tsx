"use client";

import { useState, useRef, useEffect } from "react";
import { type WidgetConfig } from "@/lib/widget-config";
import { FIELD_LIMITS } from "@/lib/field-limits";
import { ChatWidget } from "./chat-widget";

const SHADOW = 36; // transparent room for the open panel's drop shadow
// Collapsed, the launcher is the only thing on screen, so we hug it tightly.
// An iframe captures clicks across its WHOLE rectangle (transparency doesn't
// matter), so any extra padding here becomes a dead zone over the host page.
const SHADOW_TIGHT = 12; // just enough room for the launcher's own shadow
const MARGIN = 18; // gap between widget and the viewport corner
const GAP = 8; // gap between panel and the close button
const X_SIZE = 56;
const BUBBLE_SIZE = 72; // ~30% larger launcher bubble (was 56)
const LAUNCHER_SHADOW = "0 5px 14px rgba(0,0,0,.20)"; // tight, fits SHADOW_TIGHT

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

function ChatIcon({
  fill,
  dot,
  size = 26,
}: {
  fill: string;
  dot: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    // The loader posts the viewport once on iframe load, which can land before
    // this listener exists. Announce readiness so it (re)sends it now.
    try {
      window.parent.postMessage({ type: "bleviq:ready" }, "*");
    } catch {
      /* ignore */
    }
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const panelW = Math.max(260, Math.min(config.panelWidth || 380, vw - 2 * MARGIN - 4));
  const panelH = Math.max(
    360,
    Math.min(config.panelHeight || 560, vh - 2 * MARGIN - GAP - X_SIZE - 4)
  );

  // On phones, the open chat takes over the full screen so focusing the input
  // scrolls inside the chat (not the host page) and clears the keyboard.
  const isMobile = vw > 0 && vw <= 640;
  const fullscreen = open && isMobile;

  // Track the visual viewport so the panel shrinks to the area above the
  // on-screen keyboard, keeping the input visible without scrolling the host.
  const [vvh, setVvh] = useState(0);
  useEffect(() => {
    if (!fullscreen || typeof window === "undefined" || !window.visualViewport) {
      setVvh(0);
      return;
    }
    const vv = window.visualViewport;
    const update = () => setVvh(vv.height);
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [fullscreen]);

  const panelWidth = fullscreen ? "100%" : panelW;
  const panelHeight = fullscreen ? vvh || vh : panelH;

  // Report our exact footprint to the loader so it can size the iframe.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    function post() {
      if (!el) return;
      try {
        window.parent.postMessage(
          fullscreen
            ? { type: "bleviq:resize", full: true, side: left ? "left" : "right" }
            : {
                type: "bleviq:resize",
                full: false,
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
  }, [left, fullscreen]);

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

  // When collapsed, only the launcher shows, so shrink the page-facing padding
  // to a tight shadow allowance. This keeps the iframe's click/visual footprint
  // hugging the bubble instead of blanketing the page corner (which was eating
  // footer clicks and showing a faint box). Roomy SHADOW padding is reserved
  // for the open panel, whose larger shadow needs the space.
  const collapsedPad = left
    ? { paddingTop: SHADOW_TIGHT, paddingRight: SHADOW_TIGHT, paddingBottom: MARGIN, paddingLeft: MARGIN }
    : { paddingTop: SHADOW_TIGHT, paddingLeft: SHADOW_TIGHT, paddingBottom: MARGIN, paddingRight: MARGIN };
  const activePad = open ? pad : collapsedPad;

  return (
    <div
      ref={rootRef}
      style={
        fullscreen
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "flex-start",
            }
          : {
              position: "fixed",
              bottom: 0,
              left: left ? 0 : "auto",
              right: left ? "auto" : 0,
              display: "flex",
              flexDirection: "column",
              alignItems: left ? "flex-start" : "flex-end",
              justifyContent: "flex-end",
              ...activePad,
            }
      }
    >
      {/* Panel stays mounted (preserves chat history); hidden when closed. */}
      <div
        style={{
          display: open ? "block" : "none",
          width: panelWidth,
          height: panelHeight,
          marginBottom: fullscreen ? 0 : GAP,
          borderRadius: fullscreen ? 0 : 16,
          overflow: "hidden",
          isolation: "isolate",
          background: "transparent",
          boxShadow: fullscreen ? "none" : "0 10px 34px rgba(0,0,0,.22)",
          transformOrigin: left ? "bottom left" : "bottom right",
          animation: fullscreen ? "none" : "bvPop .28s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <ChatWidget
          widgetKey={widgetKey}
          config={config}
          radius={fullscreen ? 0 : 16}
          onClose={closeChat}
          pendingQuestion={pending}
          onQuestionConsumed={() => setPending(undefined)}
        />
      </div>

      {open ? (
        fullscreen ? null : (
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
        )
      ) : config.launcherStyle === "bar" ? (
        <BarLauncher config={config} left={left} onOpen={openChat} />
      ) : (
        <BubbleLauncher config={config} left={left} isMobile={isMobile} onOpen={() => openChat()} />
      )}

      <style>{`@keyframes bvPop{0%{opacity:0;transform:translateY(12px) scale(.94)}100%{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}

function BubbleLauncher({
  config,
  left,
  isMobile,
  onOpen,
}: {
  config: WidgetConfig;
  left: boolean;
  isMobile: boolean;
  onOpen: () => void;
}) {
  // The launcher reads a touch smaller on a phone screen, so bump it up there.
  const size = isMobile ? 84 : BUBBLE_SIZE;
  const avatarSize = isMobile ? 58 : 50;
  const iconSize = isMobile ? 40 : 34;
  const btn = (
    <button
      onClick={onOpen}
      aria-label="Open chat"
      style={{
        width: size,
        height: size,
        borderRadius: left ? "24px 24px 24px 10px" : "24px 24px 10px 24px",
        background: config.bubbleColor,
        border: "none",
        cursor: "pointer",
        boxShadow: LAUNCHER_SHADOW,
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
          style={{ width: avatarSize, height: avatarSize, borderRadius: 16, objectFit: "cover" }}
        />
      ) : (
        <ChatIcon fill={readable(config.bubbleColor)} dot={config.bubbleColor} size={iconSize} />
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
          boxShadow: LAUNCHER_SHADOW,
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
            onPointerDown={(e) => {
              // On touch, don't focus this fixed bottom-bar input: iOS scrolls
              // the host page to lift it above the keyboard. Open the full
              // panel instead (it doesn't autofocus, so it won't scroll).
              // Mouse users keep inline typing in the bar.
              if (e.pointerType !== "mouse") {
                e.preventDefault();
                onOpen();
              }
            }}
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
            maxLength={FIELD_LIMITS.chatMessage}
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
          lineHeight: 1.45,
          color: "#64748b",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,.12)",
          overflow: "hidden",
          whiteSpace: "normal",
          maxWidth: 250,
          textAlign: "left",
          maxHeight: expanded ? 140 : 0,
          opacity: expanded ? 1 : 0,
          transform: expanded ? "translateY(0)" : "translateY(-4px)",
          marginTop: expanded ? 8 : 0,
          padding: expanded ? "8px 12px" : "0 12px",
          transition:
            "max-height .28s ease, opacity .2s ease, transform .28s ease, " +
            "margin-top .28s ease, padding .28s ease",
        }}
      >
        You&rsquo;re chatting with an AI. Messages may be stored. By continuing,
        you agree to our{" "}
        <a
          href="https://www.bleviq.com/ai-terms"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          AI Terms
        </a>
        .
      </div>
    </div>
  );
}
