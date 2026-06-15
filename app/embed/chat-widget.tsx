"use client";

import { useState, useRef, useEffect } from "react";
import { type WidgetConfig, resolveFont } from "@/lib/widget-config";

type Msg = { role: "user" | "assistant"; content: string };

// Pick readable foreground (dark or white) for a given hex background.
function readable(bg: string): string {
  const h = bg.replace("#", "");
  if (h.length < 6) return "#0f172a";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.62 ? "#0f172a" : "#ffffff";
}

function Avatar({ config, size }: { config: WidgetConfig; size: number }) {
  if (!config.avatarUrl) return null;
  const radius = Math.round(size * 0.32);
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={config.avatarUrl}
      alt=""
      style={{
        height: size,
        width: size,
        borderRadius: radius,
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  );
}

function LinkChip({
  href,
  label,
  config,
}: {
  href: string;
  label: string;
  config: WidgetConfig;
}) {
  if (!/^https?:\/\//i.test(href)) return <>{label}</>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 10px",
        margin: "2px 2px",
        borderRadius: 9999,
        background: config.bubbleColor,
        color: readable(config.bubbleColor),
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.6,
      }}
    >
      {label}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </a>
  );
}

function renderInline(
  text: string,
  config: WidgetConfig,
  keyBase: string
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re =
    /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = keyBase + "-" + i++;
    if (m[1] !== undefined) {
      out.push(<LinkChip key={k} href={m[2]} label={m[1]} config={config} />);
    } else if (m[3] !== undefined || m[4] !== undefined) {
      out.push(<strong key={k}>{m[3] ?? m[4]}</strong>);
    } else if (m[5] !== undefined) {
      out.push(
        <code key={k} style={{ background: "rgba(0,0,0,.06)", borderRadius: 4, padding: "0 4px", fontSize: 13 }}>
          {m[5]}
        </code>
      );
    } else if (m[6] !== undefined || m[7] !== undefined) {
      out.push(<em key={k}>{m[6] ?? m[7]}</em>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function MessageContent({ text, config }: { text: string; config: WidgetConfig }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let b = 0;
  const bullet = /^\s*[-*•]\s+/;
  const ordered = /^\s*\d+\.\s+/;

  while (i < lines.length) {
    if (!lines[i].trim()) {
      i++;
      continue;
    }
    if (bullet.test(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && bullet.test(lines[i])) {
        items.push(lines[i].replace(bullet, ""));
        i++;
      }
      const bk = "b" + b++;
      blocks.push(
        <ul key={bk} style={{ margin: "2px 0 6px", paddingLeft: 18 }}>
          {items.map((it, j) => (
            <li key={j} style={{ margin: "2px 0" }}>
              {renderInline(it, config, bk + "-" + j)}
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (ordered.test(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && ordered.test(lines[i])) {
        items.push(lines[i].replace(ordered, ""));
        i++;
      }
      const bk = "b" + b++;
      blocks.push(
        <ol key={bk} style={{ margin: "2px 0 6px", paddingLeft: 20 }}>
          {items.map((it, j) => (
            <li key={j} style={{ margin: "2px 0" }}>
              {renderInline(it, config, bk + "-" + j)}
            </li>
          ))}
        </ol>
      );
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !bullet.test(lines[i]) &&
      !ordered.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    const bk = "b" + b++;
    blocks.push(
      <p key={bk} style={{ margin: "0 0 6px" }}>
        {para.map((ln, j) => (
          <span key={j}>
            {renderInline(ln, config, bk + "-" + j)}
            {j < para.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    );
  }

  return <div style={{ marginBottom: -6 }}>{blocks}</div>;
}

export function ChatWidget({
  widgetKey,
  config,
  radius,
  onClose,
  pendingQuestion,
  onQuestionConsumed,
}: {
  widgetKey: string;
  config: WidgetConfig;
  radius?: number;
  onClose?: () => void;
  pendingQuestion?: string;
  onQuestionConsumed?: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: config.greeting },
  ]);
  const [input, setInput] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const font = resolveFont(config.fontFamily);

  const headerBg = config.headerColor;
  const headerFg = readable(headerBg);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, busy]);

  function close() {
    if (onClose) {
      onClose();
      return;
    }
    try {
      window.parent.postMessage({ type: "bleviq-close" }, "*");
    } catch {
      /* ignore */
    }
  }

  async function sendText(q: string) {
    q = q.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetKey, question: q, hp }),
      });
      const data = await res.json();
      const reply =
        data.answer || data.error || "Sorry, something went wrong. Please try again.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function send() {
    sendText(input);
  }

  // A question typed in the launcher's chat bar is handed in via prop.
  const sendRef = useRef(sendText);
  sendRef.current = sendText;
  useEffect(() => {
    if (pendingQuestion) {
      setFocused(true);
      sendRef.current(pendingQuestion);
      onQuestionConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion]);

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: radius || 0,
        overflow: "hidden",
        background: "transparent",
        color: config.textColor,
        fontFamily: font,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          background: headerBg,
          borderTopLeftRadius: radius || 0,
          borderTopRightRadius: radius || 0,
        }}
      >
        <Avatar config={config} size={36} />
        <span
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: 700,
            color: headerFg,
            letterSpacing: "-0.01em",
          }}
        >
          {config.assistantName}
        </span>
        <button
          onClick={close}
          aria-label="Close chat"
          style={{
            border: "none",
            background: "transparent",
            color: headerFg,
            cursor: "pointer",
            opacity: 0.85,
            padding: 4,
            display: "grid",
            placeItems: "center",
            borderRadius: 8,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      {/* Body carries the chat background, so the header owns the top corners
          and no light layer bleeds behind it. */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: config.backgroundColor,
          borderBottomLeftRadius: radius || 0,
          borderBottomRightRadius: radius || 0,
        }}
      >
        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  maxWidth: "82%",
                  borderRadius: 18,
                  borderBottomRightRadius: 6,
                  padding: "9px 13px",
                  fontSize: 14,
                  lineHeight: 1.45,
                  background: config.userBubbleColor,
                  color: "#fff",
                }}
              >
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <Avatar config={config} size={26} />
              <div
                style={{
                  maxWidth: "82%",
                  borderRadius: 18,
                  borderBottomLeftRadius: 6,
                  padding: "9px 13px",
                  fontSize: 14,
                  lineHeight: 1.45,
                  background: config.assistantBubbleColor,
                  color: config.textColor,
                }}
              >
                <MessageContent text={m.content} config={config} />
              </div>
            </div>
          )
        )}
        {busy && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <Avatar config={config} size={26} />
            <div
              style={{
                display: "flex",
                gap: 4,
                borderRadius: 18,
                borderBottomLeftRadius: 6,
                padding: "12px 14px",
                background: config.assistantBubbleColor,
              }}
            >
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  style={{
                    height: 6,
                    width: 6,
                    borderRadius: "50%",
                    background: config.textColor,
                    opacity: 0.4,
                    animation: "bvBlink 1.2s ease-in-out infinite",
                    animationDelay: d * 0.15 + "s",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "10px 14px 6px" }}>
        <input
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: -9999, width: 1, height: 1 }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f1f5f9",
            borderRadius: 9999,
            padding: "6px 6px 6px 16px",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setFocused(true)}
            placeholder="Type here..."
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 14,
              color: "#0f172a",
              fontFamily: font,
            }}
          />
          <button
            onClick={send}
            disabled={busy}
            aria-label="Send"
            style={{
              height: 36,
              width: 36,
              flexShrink: 0,
              borderRadius: "50%",
              border: "none",
              background: config.bubbleColor,
              color: "#fff",
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.6 : 1,
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "6px 16px 10px",
          fontSize: 11,
          color: "#64748b",
        }}
      >
        <span>{focused ? "This chat is recorded." : ""}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10 }}>Powered by</span>
          <a
            href="https://bleviq.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bleviq"
            style={{ display: "inline-flex", lineHeight: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Bleviq" style={{ height: 13, width: "auto" }} />
          </a>
        </span>
      </div>
      </div>

      <style>{`@keyframes bvBlink{0%,80%,100%{opacity:.25}40%{opacity:.9}}`}</style>
    </div>
  );
}
