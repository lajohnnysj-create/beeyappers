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
      if (!res.ok) {
        setError(data.error || "Crawl failed.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={busy}
        className="rounded-lg border border-brand-600 px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
      >
        {busy ? "Crawling..." : "Crawl site"}
      </button>
      {busy && (
        <span className="text-xs text-slate-500">This can take a minute.</span>
      )}
      {error && <span className="max-w-[12rem] text-xs text-red-600">{error}</span>}
    </div>
  );
}
