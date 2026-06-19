"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  type TooltipProps,
} from "recharts";
import { getAnalytics } from "./actions";
import type { Analytics, Bucket } from "@/lib/analytics/types";

type Range = "today" | "7d" | "14d" | "30d" | "custom";

const RANGES: { id: Range; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7d" },
  { id: "14d", label: "14d" },
  { id: "30d", label: "30d" },
  { id: "custom", label: "Custom" },
];

const BRAND = "#4f46e5"; // messages line
const BRAND_SOFT = "#a5b4fc"; // conversations line

function rangeParams(
  range: Range,
  customFrom: string,
  customTo: string
): { fromIso: string; toIso: string; bucket: Bucket; tz: string } | null {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const now = new Date();

  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { fromIso: start.toISOString(), toIso: now.toISOString(), bucket: "hour", tz };
  }
  if (range === "custom") {
    if (!customFrom || !customTo) return null;
    const f = new Date(customFrom + "T00:00:00");
    const t = new Date(customTo + "T23:59:59");
    if (isNaN(f.getTime()) || isNaN(t.getTime()) || f >= t) return null;
    const span = (t.getTime() - f.getTime()) / 864e5;
    const bucket: Bucket = span <= 2 ? "hour" : span <= 92 ? "day" : "week";
    return { fromIso: f.toISOString(), toIso: t.toISOString(), bucket, tz };
  }
  const days = range === "14d" ? 14 : range === "30d" ? 30 : 7;
  const start = new Date(now.getTime() - days * 864e5);
  return { fromIso: start.toISOString(), toIso: now.toISOString(), bucket: "day", tz };
}

// Local-time bucket keys matching the RPC's date_trunc(... at time zone tz).
function fmtKey(d: Date, bucket: Bucket): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (bucket === "hour") return `${y}-${m}-${day}T${String(d.getHours()).padStart(2, "0")}`;
  return `${y}-${m}-${day}`;
}
function seriesKey(t: string, bucket: Bucket): string {
  return bucket === "hour" ? t.slice(0, 13) : t.slice(0, 10);
}
function labelFor(d: Date, bucket: Bucket): string {
  if (bucket === "hour") {
    return d.toLocaleTimeString([], { hour: "numeric" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

type ChartRow = { label: string; messages: number; conversations: number };

function buildChart(
  data: Analytics,
  fromIso: string,
  toIso: string,
  bucket: Bucket
): ChartRow[] {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const cur = new Date(from);
  if (bucket === "hour") {
    cur.setMinutes(0, 0, 0);
  } else {
    cur.setHours(0, 0, 0, 0);
    if (bucket === "week") {
      const dow = (cur.getDay() + 6) % 7; // Monday-aligned, like date_trunc('week')
      cur.setDate(cur.getDate() - dow);
    }
  }

  const msgMap = new Map(data.msg_series.map((p) => [seriesKey(p.t, bucket), p.v]));
  const convMap = new Map(data.conv_series.map((p) => [seriesKey(p.t, bucket), p.v]));

  const rows: ChartRow[] = [];
  let guard = 0;
  while (cur <= to && guard < 2000) {
    const k = fmtKey(cur, bucket);
    rows.push({
      label: labelFor(cur, bucket),
      messages: msgMap.get(k) ?? 0,
      conversations: convMap.get(k) ?? 0,
    });
    if (bucket === "hour") cur.setHours(cur.getHours() + 1);
    else if (bucket === "day") cur.setDate(cur.getDate() + 1);
    else cur.setDate(cur.getDate() + 7);
    guard++;
  }
  return rows;
}

function ChartTooltip({
  active,
  payload,
  label,
  showConv,
}: TooltipProps<number, string> & { showConv: boolean }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload as ChartRow | undefined;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <div className="font-medium text-slate-700">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-slate-600">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: BRAND }} />
        {row.messages} message{row.messages === 1 ? "" : "s"}
      </div>
      {showConv && (
        <div className="mt-0.5 flex items-center gap-2 text-slate-600">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: BRAND_SOFT }} />
          {row.conversations} conversation{row.conversations === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}

function Icon({
  children,
  className = "h-4 w-4 shrink-0 text-slate-400",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function CountryLabel({ code }: { code: string }) {
  const isCode = /^[A-Za-z]{2}$/.test(code);
  return (
    <span className="flex items-center gap-2">
      {isCode ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
          alt=""
          width={20}
          height={15}
          loading="lazy"
          className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-slate-200"
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : (
        <svg
          className="h-4 w-5 shrink-0 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )}
      <span>{isCode ? code.toUpperCase() : code}</span>
    </span>
  );
}

function BarList({
  title,
  rows,
  renderKey,
  icon,
}: {
  title: string;
  rows: { k: string; v: number }[];
  renderKey?: (k: string) => React.ReactNode;
  icon?: React.ReactNode;
}) {
  const max = rows.reduce((m, r) => Math.max(m, r.v), 0) || 1;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        {icon}
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.slice(0, 8).map((r) => (
            <li key={r.k}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{renderKey ? renderKey(r.k) : r.k}</span>
                <span className="tabular-nums text-slate-500">{r.v}</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${Math.max(4, (r.v / max) * 100)}%`, background: BRAND }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function HoursPanel({ hours }: { hours: { k: number; v: number }[] }) {
  const map = new Map(hours.map((h) => [h.k, h.v]));
  const max = hours.reduce((m, h) => Math.max(m, h.v), 0) || 1;
  const bars = Array.from({ length: 24 }, (_, h) => map.get(h) ?? 0);
  const fmtHour = (h: number) => {
    const ap = h < 12 ? "AM" : "PM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr} ${ap}`;
  };
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </Icon>
        Busiest hours
      </h3>
      <div className="mt-4 flex flex-1 items-end gap-[3px]" style={{ minHeight: 96 }}>
        {bars.map((v, h) => (
          <div key={h} className="group relative flex h-full flex-1 items-end">
            <div
              className="relative w-full rounded-sm transition-colors"
              style={{
                height: `${Math.max(2, (v / max) * 100)}%`,
                background: v > 0 ? BRAND : "#e2e8f0",
              }}
            >
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                <span className="font-medium">{fmtHour(h)}</span>
                <span className="text-slate-500">
                  {" · "}
                  {v} message{v === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>12a</span>
        <span>6a</span>
        <span>12p</span>
        <span>6p</span>
        <span>11p</span>
      </div>
    </section>
  );
}

export function AnalyticsPanel({ siteId }: { siteId: string }) {
  const [range, setRange] = useState<Range>("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConv, setShowConv] = useState(true);

  // The params that the current selection resolves to (also used to build the
  // continuous chart axis client-side).
  const params = useMemo(
    () => rangeParams(range, customFrom, customTo),
    [range, customFrom, customTo]
  );

  useEffect(() => {
    if (!params) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAnalytics(siteId, params.fromIso, params.toIso, params.bucket, params.tz).then(
      (res) => {
        if (cancelled) return;
        if (res.error) {
          setError(res.error);
          setData(null);
        } else {
          setData(res.data ?? null);
        }
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [siteId, params]);

  const chart = useMemo(() => {
    if (!data || !params) return [];
    return buildChart(data, params.fromIso, params.toIso, params.bucket);
  }, [data, params]);

  const convRate =
    data && data.conversations_total > 0
      ? Math.round((data.leads_total / data.conversations_total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header + range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Icon className="h-5 w-5 shrink-0 text-brand-600">
            <path d="M3 3v18h18" />
            <rect x="7" y="11" width="3" height="6" rx="0.5" />
            <rect x="12" y="7" width="3" height="10" rx="0.5" />
            <rect x="17" y="4" width="3" height="13" rx="0.5" />
          </Icon>
          Analytics
        </h2>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={
                "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
                (range === r.id
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-100")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {range === "custom" && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            From
            <input
              type="date"
              value={customFrom}
              max={customTo || undefined}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5"
            />
          </label>
          <label className="flex items-center gap-2 text-slate-600">
            To
            <input
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5"
            />
          </label>
          {!params && <span className="text-slate-400">Pick a start and end date.</span>}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Messages"
          value={loading ? "…" : String(data?.messages_total ?? 0)}
          icon={
            <Icon>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </Icon>
          }
        />
        <StatCard
          label="Conversations"
          value={loading ? "…" : String(data?.conversations_total ?? 0)}
          icon={
            <Icon>
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
            </Icon>
          }
        />
        <StatCard
          label="Visitors"
          value={loading ? "…" : String(data?.unique_visitors ?? 0)}
          icon={
            <Icon>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </Icon>
          }
        />
        <StatCard
          label="Leads"
          value={loading ? "…" : String(data?.leads_total ?? 0)}
          sub={data && data.conversations_total > 0 ? `${convRate}% of conversations` : undefined}
          icon={
            <Icon>
              <path d="M22 12h-6l-2 3h-4l-2-3H2" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </Icon>
          }
        />
      </div>

      {/* Line chart */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon>
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </Icon>
            Messages over time
          </h3>
          <button
            type="button"
            onClick={() => setShowConv((s) => !s)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: showConv ? BRAND_SOFT : "#cbd5e1" }}
            />
            {showConv ? "Hide conversations" : "Show conversations"}
          </button>
        </div>
        <div className="mt-4 h-[280px] w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Loading…
            </div>
          ) : !data || data.messages_total === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-400">
              <p>No activity in this range yet.</p>
              <p className="mt-1">Stats appear here as visitors chat with your widget.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip content={<ChartTooltip showConv={showConv} />} />
                {showConv && (
                  <Line
                    type="monotone"
                    dataKey="conversations"
                    stroke={BRAND_SOFT}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke={BRAND}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Breakdowns */}
      <div className="grid gap-4 sm:grid-cols-2">
        <BarList
          title="Top countries"
          rows={data?.countries ?? []}
          renderKey={(k) => <CountryLabel code={k} />}
          icon={
            <Icon>
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </Icon>
          }
        />
        <BarList
          title="Top cities"
          rows={data?.cities ?? []}
          icon={
            <Icon>
              <path d="M12 21s-6-5.686-6-10a6 6 0 0 1 12 0c0 4.314-6 10-6 10z" />
              <circle cx="12" cy="11" r="2.5" />
            </Icon>
          }
        />
        <BarList
          title="Devices"
          rows={data?.devices ?? []}
          renderKey={(k) => cap(k)}
          icon={
            <Icon>
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </Icon>
          }
        />
        <BarList
          title="Browsers"
          rows={data?.browsers ?? []}
          renderKey={(k) => cap(k)}
          icon={
            <Icon>
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" />
            </Icon>
          }
        />
        <div className="sm:col-span-2">
          <HoursPanel hours={data?.hours ?? []} />
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Times shown in your local timezone.
      </p>
    </div>
  );
}

function cap(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
