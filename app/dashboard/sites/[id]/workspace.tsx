"use client";

import { useState } from "react";
import { BrandingForm } from "./branding-form";
import { KnowledgePanel, type KnowledgeItem } from "./knowledge-panel";
import { TrainStatus } from "./train-status";
import { DeleteSite } from "./delete-site";
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
  knowledge: KnowledgeItem[];
  canRetrain: boolean;
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
      <div className="min-w-0">
        {tab === "train" && (
          <TrainPanel
            siteId={props.siteId}
            domain={props.domain}
            crawlStatus={props.crawlStatus}
            lastCrawledAt={props.lastCrawledAt}
            pageCount={props.pageCount}
            chunkCount={props.chunkCount}
            knowledge={props.knowledge}
            siteName={props.siteName}
            canRetrain={props.canRetrain}
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
  knowledge,
  siteName,
  canRetrain,
}: {
  siteId: string;
  domain: string | null;
  crawlStatus: string;
  lastCrawledAt: string | null;
  pageCount: number;
  chunkCount: number;
  knowledge: KnowledgeItem[];
  siteName: string;
  canRetrain: boolean;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Website</h2>
              <p className="mt-1 text-sm text-slate-600">
                Bleviq crawls {domain || "your site"} and learns its content.
              </p>
            </div>
          </div>
          <StatusBadge status={crawlStatus} />
        </div>

        <div className="mt-5">
          <TrainStatus
            siteId={siteId}
            status={crawlStatus}
            lastCrawledAt={lastCrawledAt}
            domain={domain}
            pageCount={pageCount}
            canRetrain={canRetrain}
          />
        </div>
      </section>

      <KnowledgePanel siteId={siteId} items={knowledge} />

      <DeleteSite siteId={siteId} siteName={siteName} />
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
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 6-6 6 6 6m8-12 6 6-6 6" />
            </svg>
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Install the widget</h2>
            <p className="mt-1 text-sm text-slate-600">
              Paste this snippet into your site, just before the closing{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                &lt;/body&gt;
              </code>{" "}
              tag.
            </p>
          </div>
        </div>
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
