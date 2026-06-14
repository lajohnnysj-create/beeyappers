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
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">Embed code</span>
        <button
          onClick={copy}
          className="text-xs font-medium text-brand-700 hover:text-brand-600"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <code className="block overflow-x-auto whitespace-pre font-mono text-xs text-slate-800">
        {snippet}
      </code>
    </div>
  );
}
