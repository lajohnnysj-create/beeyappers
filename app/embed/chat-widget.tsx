"use client";

import { useState, useRef, useEffect } from "react";
import {
  type WidgetConfig,
  type WidgetLabels,
  DEFAULT_LABELS,
  resolveFont,
  googleFontsHref,
} from "@/lib/widget-config";
import { FIELD_LIMITS } from "@/lib/field-limits";
import { isRtlLang } from "@/lib/lang";
import { leadError, LEAD_LIMITS } from "@/lib/lead";

type Msg = {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  collectInfo?: boolean;
};

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

function SuggestionChips({
  items,
  config,
  disabled,
  onPick,
  rtl,
}: {
  items: string[];
  config: WidgetConfig;
  disabled?: boolean;
  onPick: (q: string) => void;
  rtl?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {items.map((q, i) => (
        <button
          key={i}
          type="button"
          onClick={() => !disabled && onPick(q)}
          disabled={disabled}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid rgba(0,0,0,.10)",
            background: "#ffffff",
            color: "#1f2937",
            fontSize: 15,
            lineHeight: 1.3,
            padding: "7px 11px",
            borderRadius: 14,
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.55 : 1,
            textAlign: "start",
          }}
        >
          <span style={{ color: config.bubbleColor, fontWeight: 700 }}>
            {rtl ? "\u2039" : "\u203A"}
          </span>
          {q}
        </button>
      ))}
    </div>
  );
}

function LinkButton({
  href,
  label,
  config,
}: {
  href: string;
  label: string;
  config: WidgetConfig;
}) {
  if (!/^https?:\/\//i.test(href)) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        maxWidth: 280,
        padding: "10px 14px",
        borderRadius: 12,
        background: config.bubbleColor,
        color: readable(config.bubbleColor),
        textDecoration: "none",
        fontSize: 15,
        fontWeight: 600,
        boxShadow: "0 1px 2px rgba(0,0,0,.08)",
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
    /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_|(https?:\/\/[^\s<]+)/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = keyBase + "-" + i++;
    if (m[1] !== undefined) {
      // Label stays inline as plain text; the clickable button renders below.
      out.push(m[1]);
    } else if (m[3] !== undefined || m[4] !== undefined) {
      out.push(<strong key={k}>{m[3] ?? m[4]}</strong>);
    } else if (m[5] !== undefined) {
      out.push(
        <code key={k} style={{ background: "rgba(0,0,0,.06)", borderRadius: 4, padding: "0 4px", fontSize: 15 }}>
          {m[5]}
        </code>
      );
    } else if (m[6] !== undefined || m[7] !== undefined) {
      out.push(<em key={k}>{m[6] ?? m[7]}</em>);
    } else if (m[8] !== undefined) {
      // Bare URL: render a real link. http/https only (so no javascript: or
      // other unsafe schemes), and no innerHTML, so this stays injection-safe.
      let url = m[8];
      const tm = url.match(/[.,!?:;)\]}'"]+$/);
      let trail = "";
      if (tm) {
        trail = tm[0];
        url = url.slice(0, url.length - trail.length);
      }
      out.push(
        <a
          key={k}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: config.bubbleColor,
            textDecoration: "underline",
            wordBreak: "break-word",
          }}
        >
          {url}
        </a>
      );
      if (trail) out.push(trail);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function MessageContent({ text, config }: { text: string; config: WidgetConfig }) {
  // Collect unique page links to render as buttons under the message.
  const links: { label: string; url: string }[] = [];
  const seen = new Set<string>();
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let lm: RegExpExecArray | null;
  while ((lm = linkRe.exec(text)) !== null) {
    if (/^https?:\/\//i.test(lm[2]) && !seen.has(lm[2])) {
      seen.add(lm[2]);
      links.push({ label: lm[1], url: lm[2] });
    }
  }

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
        <ul key={bk} style={{ margin: "2px 0 6px", paddingInlineStart: 18 }}>
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
        <ol key={bk} style={{ margin: "2px 0 6px", paddingInlineStart: 20 }}>
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

  return (
    <div style={{ marginBottom: links.length ? 0 : -6 }}>
      {blocks}
      {links.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {links.map((l, j) => (
            <LinkButton key={j} href={l.url} label={l.label} config={config} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadForm({
  widgetKey,
  conversationId,
  contextMessage,
  labels,
  config,
  font,
  onCaptured,
}: {
  widgetKey: string;
  conversationId: string | null;
  contextMessage: string;
  labels: WidgetLabels;
  config: WidgetConfig;
  font: string;
  onCaptured: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = (email.trim() || phone.trim()) && !busy && !done;

  const field: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(0,0,0,.12)",
    borderRadius: 10,
    padding: "9px 11px",
    fontSize: 16, // 16px so iOS doesn't zoom on focus
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    fontFamily: font,
  };

  async function submit() {
    const v = leadError({ name, email, phone });
    if (v) {
      setErr(v);
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          widgetKey,
          conversationId,
          name,
          email,
          phone,
          message: contextMessage,
          hp: "",
        }),
      });
      if (!res.ok) throw new Error("bad status");
      setDone(true);
      onCaptured();
    } catch {
      setBusy(false);
      setErr(labels.leadError);
    }
  }

  if (done) {
    return (
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          borderRadius: 12,
          background: config.assistantBubbleColor,
          color: config.textColor,
          fontSize: 15,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={config.bubbleColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span>{labels.leadSent}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,.10)",
        background: "#fff",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={labels.leadName}
        maxLength={LEAD_LIMITS.name}
        style={field}
      />
      <input
        type="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={labels.leadEmail}
        maxLength={LEAD_LIMITS.email}
        style={field}
      />
      <input
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={labels.leadPhone}
        maxLength={LEAD_LIMITS.phone}
        style={field}
      />
      {err && (
        <span style={{ fontSize: 13, color: "#dc2626" }} role="alert">
          {err}
        </span>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        style={{
          border: "none",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 15,
          fontWeight: 600,
          color: "#fff",
          background: config.bubbleColor,
          cursor: canSubmit ? "pointer" : "default",
          opacity: canSubmit ? 1 : 0.55,
          fontFamily: font,
        }}
      >
        {labels.leadSubmit}
      </button>
    </div>
  );
}

export function ChatWidget({
  widgetKey,
  config,
  labels = DEFAULT_LABELS,
  lang = "",
  radius,
  onClose,
  pendingQuestion,
  onQuestionConsumed,
}: {
  widgetKey: string;
  config: WidgetConfig;
  labels?: WidgetLabels;
  lang?: string;
  radius?: number;
  onClose?: () => void;
  pendingQuestion?: string;
  onQuestionConsumed?: () => void;
}) {
  const rtl = isRtlLang(lang);
  const dir = rtl ? "rtl" : "ltr";
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: config.greeting },
  ]);
  const [input, setInput] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  // One stable id per chat session so every turn threads into a single
  // server-side conversation (instead of a new row per message). Set on mount,
  // persisted for the tab, reset on a fresh visit.
  const convoIdRef = useRef<string>("");
  const font = resolveFont(config.fontFamily);

  // Load the selected Google font inside the widget iframe (the host page may
  // not have it). Web-safe choices return null and skip the fetch.
  useEffect(() => {
    const href = googleFontsHref([config.fontFamily]);
    if (!href || typeof document === "undefined") return;
    const id = "bv-font-" + config.fontFamily;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [config.fontFamily]);

  // Establish the conversation id once per session (client-only).
  useEffect(() => {
    const storeKey = "bv_convo_" + widgetKey;
    let id = "";
    try {
      id = sessionStorage.getItem(storeKey) || "";
    } catch {
      /* storage blocked; we'll keep an in-memory id for this load */
    }
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
      try {
        sessionStorage.setItem(storeKey, id);
      } catch {
        /* ignore */
      }
    }
    convoIdRef.current = id;
  }, [widgetKey]);

  const headerBg = config.headerColor;
  const headerFg = readable(headerBg);
  // The footer sits on the panel background; pick the matching logo + muted
  // text color so "Powered by" stays legible on light or dark themes.
  const panelIsDark = readable(config.backgroundColor) === "#ffffff";

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const last = messages[messages.length - 1];
    // While sending / waiting, keep the newest content in view.
    if (busy || !last || last.role === "user") {
      sc.scrollTo({ top: sc.scrollHeight, behavior: "smooth" });
      return;
    }
    // A new answer arrived: align its TOP near the top so it reads from the start.
    const el = lastMsgRef.current;
    if (el) {
      const delta =
        el.getBoundingClientRect().top - sc.getBoundingClientRect().top;
      sc.scrollTo({ top: sc.scrollTop + delta - 12, behavior: "smooth" });
    } else {
      sc.scrollTo({ top: sc.scrollHeight, behavior: "smooth" });
    }
  }, [messages, busy]);

  function onScroll() {
    const sc = scrollRef.current;
    if (!sc) return;
    setAtBottom(sc.scrollHeight - sc.scrollTop - sc.clientHeight < 24);
  }
  function scrollToBottom() {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

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
    // Prior turns (minus the opening greeting) so follow-ups keep context.
    const history = messages
      .slice(1)
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          widgetKey,
          question: q,
          hp,
          history,
          conversationId: convoIdRef.current,
          lang,
          leadCaptured,
        }),
      });
      const data = await res.json();
      const reply =
        data.answer || data.error || "Sorry, something went wrong. Please try again.";
      const suggestions = Array.isArray(data.suggestions)
        ? (data.suggestions as unknown[]).filter(
            (s): s is string => typeof s === "string" && s.trim().length > 0
          )
        : undefined;
      const collectInfo = data.collectInfo === true && !leadCaptured;
      setMessages((m) => [
        ...m,
        { role: "assistant", content: reply, suggestions, collectInfo },
      ]);
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
      dir={dir}
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
            fontSize: 17,
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
        <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div
          ref={scrollRef}
          onScroll={onScroll}
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
            <div key={i} ref={i === messages.length - 1 ? lastMsgRef : undefined} style={{ display: "flex", justifyContent: "flex-end", animation: "bvFade .35s ease both" }}>
              <div
                style={{
                  maxWidth: "82%",
                  borderRadius: 18,
                  ...(rtl
                    ? { borderBottomLeftRadius: 6 }
                    : { borderBottomRightRadius: 6 }),
                  padding: "9px 13px",
                  fontSize: 16,
                  lineHeight: 1.45,
                  background: config.userBubbleColor,
                  color: "#fff",
                }}
              >
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} ref={i === messages.length - 1 ? lastMsgRef : undefined} style={{ display: "flex", alignItems: "flex-start", gap: 8, animation: "bvFade .35s ease both" }}>
              <Avatar config={config} size={26} />
              <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div
                  style={{
                    maxWidth: "100%",
                    borderRadius: 18,
                    ...(rtl
                      ? { borderBottomRightRadius: 6 }
                      : { borderBottomLeftRadius: 6 }),
                    padding: "9px 13px",
                    fontSize: 16,
                    lineHeight: 1.45,
                    background: config.assistantBubbleColor,
                    color: config.textColor,
                  }}
                >
                  <MessageContent text={m.content} config={config} />
                </div>
                {m.suggestions && m.suggestions.length > 0 && (
                  <SuggestionChips
                    items={m.suggestions}
                    config={config}
                    disabled={busy}
                    rtl={rtl}
                    onPick={(q) => sendText(q)}
                  />
                )}
                {m.collectInfo && (
                  <LeadForm
                    widgetKey={widgetKey}
                    conversationId={convoIdRef.current}
                    contextMessage={
                      i > 0 && messages[i - 1]?.role === "user"
                        ? messages[i - 1].content
                        : ""
                    }
                    labels={labels}
                    config={config}
                    font={font}
                    onCaptured={() => setLeadCaptured(true)}
                  />
                )}
              </div>
            </div>
          )
        )}
        {busy && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Avatar config={config} size={26} />
            <div
              style={{
                display: "flex",
                gap: 4,
                borderRadius: 18,
                ...(rtl
                  ? { borderBottomRightRadius: 6 }
                  : { borderBottomLeftRadius: 6 }),
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

        {!atBottom && (
          <button
            onClick={scrollToBottom}
            aria-label="Scroll to latest"
            style={{
              position: "absolute",
              bottom: 12,
              insetInlineEnd: 12,
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,.08)",
              background: "#fff",
              color: "#334155",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,.16)",
              animation: "bvFade .2s ease both",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
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
            paddingBlock: 6,
            paddingInlineStart: 16,
            paddingInlineEnd: 6,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={labels.placeholder}
            maxLength={FIELD_LIMITS.chatMessage}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 16,
              color: "#0f172a",
              fontFamily: font,
            }}
          />
          <button
            onClick={send}
            disabled={busy}
            aria-label={labels.send}
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
          padding: "6px 16px 10px",
          fontSize: 11,
          color: panelIsDark ? "rgba(255,255,255,0.6)" : "#64748b",
        }}
      >
        <p style={{ margin: 0, fontSize: 10, lineHeight: 1.45, textAlign: "center" }}>
          You&rsquo;re chatting with an AI. Messages may be stored. By
          continuing, you agree to our{" "}
          <a
            href="https://www.bleviq.com/ai-terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            AI Terms
          </a>
          .
        </p>
        {config.showBranding && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              marginTop: 5,
            }}
          >
            <span style={{ fontSize: 10 }}>{labels.poweredBy}</span>
            <a
              href="https://bleviq.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bleviq"
              style={{ display: "inline-flex", lineHeight: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={panelIsDark ? "/logowhite-small.png" : "/logoblack-small.png"}
                alt="Bleviq"
                style={{ height: 13, width: "auto" }}
              />
            </a>
          </span>
        )}
      </div>
      </div>

      <style>{`@keyframes bvBlink{0%,80%,100%{opacity:.25}40%{opacity:.9}}@keyframes bvFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
