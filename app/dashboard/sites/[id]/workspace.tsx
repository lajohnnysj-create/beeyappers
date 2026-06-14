"use client";

import { useState } from "react";
import { BrandingForm } from "./branding-form";
import { CrawlButton } from "@/app/dashboard/crawl-button";
import { EmbedSnippet } from "@/app/dashboard/embed-snippet";
import type { WidgetConfig } from "@/lib/widget-config";

type Tab = "train" | "customize" | "code";

type Props = {
  siteId: string;
  userId: string;
  siteName: string;
  domain: string | null;
  widgetKey: string;
  crawlStatus: string;
  lastCrawledAt: string | null;
  pageCount: number;
  chunkCount: number;
  config: WidgetConfig;
};

const NAV: { id: Tab; label: string; icon: JSX.Element }[] = [
  {
    id: "train",
    label: "Train",
    icon: (
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5-2 2m-7 7-2 2m11 0-2-2m-7-7-2-2" />
    ),
  },
  {
    id: "customize",
    label: "Customize",
    icon: (
      <path d="M12 2.5a9.5 9.5 0 1 0 0 19 2 2 0 0 0 2-2c0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2a1.5 1.5 0 0 1 1.5-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.3-9-8.3Z" />
    ),
  },
  {
    id: "code",
    label: "Get Code",
    icon: <path d="m8 6-6 6 6 6m8-12 6 6-6 6" />,
  },
];

export function Workspace(props: Props) {
  const [tab, setTab] = useState<Tab>("train");

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      {/* Sidebar */}
      <nav className="lg:sticky lg:top-6 lg:self-start">
        <ul className="flex gap-1 lg:flex-col">
          {NAV.map((item) => {
            const active = tab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setTab(item.id)}
                  className={
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
                    (active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </svg>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Panel */}
      <div>
        {tab === "train" && (
          <TrainPanel
            siteId={props.siteId}
            domain={props.domain}
            crawlStatus={props.crawlStatus}
            lastCrawledAt={props.lastCrawledAt}
            pageCount={props.pageCount}
            chunkCount={props.chunkCount}
          />
        )}
        {tab === "customize" && (
          <BrandingForm
            siteId={props.siteId}
            userId={props.userId}
            initialConfig={props.config}
          />
        )}
        {tab === "code" && (
          <CodePanel widgetKey={props.widgetKey} crawlStatus={props.crawlStatus} />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ready: "bg-emerald-50 text-emerald-700",
    crawling: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
    pending: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={
        "rounded-full px-2.5 py-1 text-xs font-medium capitalize " +
        (map[status] || map.pending)
      }
    >
      {status}
    </span>
  );
}

function TrainPanel({
  siteId,
  domain,
  crawlStatus,
  lastCrawledAt,
  pageCount,
  chunkCount,
}: {
  siteId: string;
  domain: string | null;
  crawlStatus: string;
  lastCrawledAt: string | null;
  pageCount: number;
  chunkCount: number;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Knowledge base</h2>
            <p className="mt-1 text-sm text-slate-600">
              Bleviq crawls {domain || "your site"} and learns its content.
            </p>
          </div>
          <StatusBadge status={crawlStatus} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:max-w-sm">
          <Stat label="Pages" value={pageCount} />
          <Stat label="Chunks" value={chunkCount} />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <CrawlButton siteId={siteId} />
          {lastCrawledAt && (
            <span className="text-xs text-slate-500">
              Last trained {new Date(lastCrawledAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </section>

      <p className="text-sm text-slate-500">
        Re-training replaces the old content with a fresh crawl. Set a domain on
        the site if it is empty.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function CodePanel({
  widgetKey,
  crawlStatus,
}: {
  widgetKey: string;
  crawlStatus: string;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-slate-900">Install the widget</h2>
        <p className="mt-1 text-sm text-slate-600">
          Paste this snippet into your site, just before the closing{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            &lt;/body&gt;
          </code>{" "}
          tag.
        </p>
        <div className="mt-4">
          <EmbedSnippet widgetKey={widgetKey} />
        </div>
        {crawlStatus !== "ready" && (
          <p className="mt-3 text-xs text-amber-700">
            Train your site first so the widget has something to answer from.
          </p>
        )}
      </section>
    </div>
  );
}
