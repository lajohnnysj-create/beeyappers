"use client";

import { useState, useEffect } from "react";

export function EmbedSnippet({ widgetKey }: { widgetKey: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const snippet = `<script src="${origin}/widget.js" data-widget-key="${widgetKey}"></script>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; user can select manually */
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-medium text-slate-400">Embed snippet</span>
        <button
          onClick={copy}
          className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-white/20"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <code className="block whitespace-pre-wrap break-all px-4 py-3 font-mono text-xs text-slate-100">
        {snippet}
      </code>
    </div>
  );
}
