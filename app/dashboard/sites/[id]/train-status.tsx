"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MAX_PAGES } from "@/lib/crawl/limits";

const MESSAGES = [
  "Reading your pages...",
  "Learning your content...",
  "Understanding your site...",
  "Building your knowledge base...",
  "Almost there...",
];

function cleanDomain(d?: string | null): { label: string; href: string } | null {
  if (!d) return null;
  const label = d.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  if (!label) return null;
  return { label, href: /^https?:\/\//i.test(d) ? d : "https://" + label };
}

export function TrainStatus({
  siteId,
  status,
  lastCrawledAt,
  domain,
  pageCount,
}: {
  siteId: string;
  status: string;
  lastCrawledAt: string | null;
  domain?: string | null;
  pageCount?: number;
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

  const site = cleanDomain(domain);
  const btnClass =
    "inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 active:scale-[.98]";

  // Before the first successful crawl: just the call to action.
  if (status !== "ready") {
    return (
      <div className="flex flex-col items-start gap-2">
        <button onClick={startCrawl} className={btnClass}>
          Train site
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch">
      <div className="sm:w-[260px] sm:shrink-0">
        <SitePreview siteId={siteId} version={lastCrawledAt} domain={site?.label} />
      </div>

      <div className="flex flex-1 flex-col">
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <dt className="text-xs font-medium text-slate-500">Pages trained</dt>
            <dd className="mt-0.5 text-lg font-semibold text-slate-900">
              {pageCount ?? 0}
              {(pageCount ?? 0) >= MAX_PAGES && (
                <span className="ml-1 text-xs font-medium text-slate-500">
                  (Max)
                </span>
              )}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <dt className="text-xs font-medium text-slate-500">Last trained</dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
              {lastCrawledAt
                ? new Date(lastCrawledAt).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
        </dl>

        {site && (
          <a
            href={site.href}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            {site.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
        )}

        <div className="mt-auto flex flex-col items-start gap-2 pt-4">
          <button onClick={startCrawl} className={btnClass}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            Re-train site
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}

function SitePreview({
  siteId,
  version,
  domain,
}: {
  siteId: string;
  version?: string | null;
  domain?: string | null;
}) {
  const [loaded, setLoaded] = useState(false);
  const src =
    `/api/screenshot?siteId=${siteId}` +
    (version ? `&v=${encodeURIComponent(version)}` : "");
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        {domain && (
          <span className="ml-1.5 truncate text-[11px] text-slate-500">
            {domain}
          </span>
        )}
      </div>
      <div className="relative aspect-[16/10] w-full bg-slate-100">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-200" />
        )}
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
