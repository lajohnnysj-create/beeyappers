"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CrawlButton({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Training failed.");
      else router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 active:scale-[.98] disabled:opacity-60"
      >
        {busy ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Training...
          </>
        ) : (
          "Train site"
        )}
      </button>
      {busy && (
        <span className="text-xs text-slate-500">This can take a minute.</span>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
