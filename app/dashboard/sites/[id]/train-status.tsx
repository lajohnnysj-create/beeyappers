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
  canRetrain = true,
  pageCap = MAX_PAGES,
}: {
  siteId: string;
  status: string;
  lastCrawledAt: string | null;
  domain?: string | null;
  pageCount?: number;
  canRetrain?: boolean;
  pageCap?: number;
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
        {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
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
            <dt className="flex items-center gap-1 text-xs font-medium text-slate-500">
              Pages trained
              <InfoTip
                text={
                  pageCap === MAX_PAGES
                    ? "Trains up to 100 pages on default. Please reach out to sales if you need to increase this limit"
                    : `Custom: Trains up to ${pageCap} pages.`
                }
              />
            </dt>
            <dd className="mt-0.5 text-lg font-semibold text-slate-900">
              {pageCount ?? 0}
              {(pageCount ?? 0) >= pageCap && (
                <span className="ml-1 text-xs font-medium text-slate-500">
                  (Max)
                </span>
              )}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <dt className="text-xs font-medium text-slate-500">Last trained</dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900" suppressHydrationWarning>
              {lastCrawledAt ? (
                <>
                  {new Date(lastCrawledAt).toLocaleDateString()}
                  <span className="ml-1 text-xs font-normal text-slate-500" suppressHydrationWarning>
                    at{" "}
                    {new Date(lastCrawledAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </>
              ) : (
                "\u2014"
              )}
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
          {canRetrain ? (
            <button onClick={startCrawl} className={btnClass}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
              Re-train site
            </button>
          ) : (
            <div className="group relative inline-block cursor-not-allowed">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className={`${btnClass} pointer-events-none opacity-50`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                  <path d="M21 3v6h-6" />
                </svg>
                Re-train site
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 w-max max-w-[15rem] rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-normal leading-snug text-white opacity-0 invisible shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100"
              >
                Please upgrade to re-train your website
              </span>
            </div>
          )}
          {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="grid h-3.5 w-3.5 cursor-help place-items-center rounded-full border border-slate-400 text-[9px] font-bold leading-none text-slate-500 transition hover:border-slate-500 hover:text-slate-700"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 w-max max-w-[14rem] rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-normal leading-snug text-white opacity-0 invisible shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
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
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const base =
    `/api/screenshot?siteId=${siteId}` +
    (version ? `&v=${encodeURIComponent(version)}` : "");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let objectUrl: string | null = null;

    const MAX_ATTEMPTS = 4; // beyond the first try
    const RETRY_MS = 5000; // give mShots time to finish rendering

    async function attempt(n: number) {
      // First try uses the plain URL so a cached real shot loads instantly;
      // retries add a cache-buster to force a fresh render server-side.
      const url = n === 0 ? base : `${base}&r=${n}`;
      try {
        const res = await fetch(url, n === 0 ? {} : { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) throw new Error(String(res.status));

        const blob = await res.blob();
        if (cancelled) return;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(blob);
        setImgUrl(objectUrl);
        setFailed(false);

        // Show what we have, but keep trying if it was only the placeholder.
        const real = res.headers.get("X-Shot-Status") === "real";
        if (!real && n < MAX_ATTEMPTS) {
          timer = setTimeout(() => attempt(n + 1), RETRY_MS);
        }
      } catch {
        if (cancelled) return;
        if (n < MAX_ATTEMPTS) {
          timer = setTimeout(() => attempt(n + 1), RETRY_MS);
        } else if (!objectUrl) {
          setFailed(true);
        }
      }
    }

    setImgUrl(null);
    setFailed(false);
    attempt(0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [base]);

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
        {!imgUrl && !failed && (
          <div className="absolute inset-0 animate-pulse bg-slate-200" />
        )}
        {imgUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgUrl}
            alt="Homepage preview"
            className="h-full w-full object-cover object-top"
          />
        )}
        {failed && (
          <div className="absolute inset-0 grid place-items-center px-4 text-center text-xs text-slate-400">
            Preview unavailable
          </div>
        )}
      </div>
    </div>
  );
}

export function TrainingWidget({ message }: { message: string }) {
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
