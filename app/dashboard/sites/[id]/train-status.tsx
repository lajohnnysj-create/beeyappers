"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MESSAGES = [
  "Reading your pages...",
  "Learning your content...",
  "Understanding your site...",
  "Building your knowledge base...",
  "Almost there...",
];

export function TrainStatus({
  siteId,
  status,
  lastCrawledAt,
}: {
  siteId: string;
  status: string;
  lastCrawledAt: string | null;
}) {
  const router = useRouter();
  const [training, setTraining] = useState(
    status === "pending" || status === "crawling"
  );
  const [error, setError] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const started = useRef(false);

  async function startCrawl() {
    setTraining(true);
    setError(null);
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Training failed. Try again.");
        setTraining(false);
      } else {
        setTraining(false);
        router.refresh();
      }
    } catch {
      setError("Network error. Try again.");
      setTraining(false);
    }
  }

  // Auto-start the crawl for a brand-new (pending) site.
  useEffect(() => {
    if (status === "pending" && !started.current) {
      started.current = true;
      startCrawl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // If a crawl is already running (e.g. the page was refreshed mid-crawl),
  // poll until it finishes, then refresh.
  useEffect(() => {
    if (status !== "crawling") return;
    started.current = true;
    setTraining(true);
    const supabase = createClient();
    const id = setInterval(async () => {
      const { data } = await supabase
        .from("sites")
        .select("crawl_status")
        .eq("id", siteId)
        .single();
      if (data && data.crawl_status !== "crawling") {
        clearInterval(id);
        setTraining(false);
        router.refresh();
      }
    }, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, siteId]);

  // Cycle the status messages while training.
  useEffect(() => {
    if (!training) return;
    const id = setInterval(
      () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
      2200
    );
    return () => clearInterval(id);
  }, [training]);

  if (training) return <TrainingWidget message={MESSAGES[msgIdx]} />;

  return (
    <div className="space-y-4">
      {status === "ready" && (
        <SitePreview siteId={siteId} version={lastCrawledAt} />
      )}
      <div className="flex flex-col gap-2">
        <button
          onClick={startCrawl}
          className="inline-flex w-fit items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 active:scale-[.98]"
        >
          {status === "ready" ? "Re-train site" : "Train site"}
        </button>
        {status === "ready" && lastCrawledAt && (
          <span className="text-xs text-slate-500">
            Last trained {new Date(lastCrawledAt).toLocaleDateString()}
          </span>
        )}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}

function SitePreview({
  siteId,
  version,
}: {
  siteId: string;
  version?: string | null;
}) {
  const [loaded, setLoaded] = useState(false);
  const src =
    `/api/screenshot?siteId=${siteId}` +
    (version ? `&v=${encodeURIComponent(version)}` : "");
  return (
    <div className="relative aspect-[16/10] w-full max-w-[400px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt="Homepage preview"
        onLoad={() => setLoaded(true)}
        className={
          "h-full w-full object-cover object-top transition-opacity duration-300 " +
          (loaded ? "opacity-100" : "opacity-0")
        }
      />
    </div>
  );
}

function TrainingWidget({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-8 text-center">
      <div className="relative mx-auto h-20 w-20">
        <div className="absolute inset-0 animate-pulse rounded-full bg-brand-400/30 blur-xl" />
        <svg
          className="relative h-20 w-20 animate-spin"
          viewBox="0 0 50 50"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bvspin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          <circle cx="25" cy="25" r="20" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="url(#bvspin)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80 130"
          />
        </svg>
      </div>
      <p className="mt-5 text-base font-semibold text-slate-900">
        Training your AI
      </p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      <div className="mx-auto mt-5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 animate-bv-bar" />
      </div>
    </div>
  );
}
