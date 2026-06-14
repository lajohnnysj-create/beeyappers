"use client";

import { useState, useRef, useEffect } from "react";
import { type WidgetConfig, resolveFont } from "@/lib/widget-config";

type Msg = { role: "user" | "assistant"; content: string };

function Avatar({ config }: { config: WidgetConfig }) {
  if (config.faviconUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={config.faviconUrl}
        alt=""
        style={{
          height: 24,
          width: 24,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span
      style={{
        height: 24,
        width: 24,
        borderRadius: "50%",
        background: config.bubbleColor,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

export function ChatWidget({
  widgetKey,
  config,
}: {
  widgetKey: string;
  config: WidgetConfig;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: config.greeting },
  ]);
  const [input, setInput] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const font = resolveFont(config.fontFamily);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, busy]);

  async function send() {
    const q = input.trim();
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
        height: "100vh",
        background: config.backgroundColor,
        color: config.textColor,
        fontFamily: font,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          background: config.headerColor,
        }}
      >
        {config.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.logoUrl} alt="" style={{ height: 24, width: "auto" }} />
        ) : null}
        <span style={{ fontSize: 14, fontWeight: 600, color: config.textColor }}>
          {config.assistantName}
        </span>
      </header>

      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
      >
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  maxWidth: "80%",
                  borderRadius: 16,
                  padding: "8px 12px",
                  fontSize: 14,
                  background: config.userBubbleColor,
                  color: "#fff",
                }}
              >
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Avatar config={config} />
              <div
                style={{
                  maxWidth: "80%",
                  borderRadius: 16,
                  padding: "8px 12px",
                  fontSize: 14,
                  background: config.assistantBubbleColor,
                  color: config.textColor,
                }}
              >
                {m.content}
              </div>
            </div>
          )
        )}
        {busy && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar config={config} />
            <div
              style={{
                borderRadius: 16,
                padding: "8px 12px",
                fontSize: 14,
                background: config.assistantBubbleColor,
                color: config.textColor,
                opacity: 0.7,
              }}
            >
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: 12 }}>
        <input
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: -9999, width: 1, height: 1 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type your question..."
            style={{
              flex: 1,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              padding: "8px 12px",
              fontSize: 14,
              color: "#0f172a",
              outline: "none",
              fontFamily: font,
            }}
          />
          <button
            onClick={send}
            disabled={busy}
            style={{
              borderRadius: 8,
              border: "none",
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              background: config.bubbleColor,
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
