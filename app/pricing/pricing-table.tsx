"use client";

import { useState } from "react";
import {
  PLANS,
  PLAN_ORDER,
  annualTotal,
  type PlanKey,
  type Interval,
} from "@/lib/billing/plans";

function Check() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-brand-600"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function PricingTable({ canceled = false }: { canceled?: boolean }) {
  const [interval, setInterval] = useState<Interval>("month");
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(plan: PlanKey) {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      if (res.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Try again.");
        setLoading(null);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      setError("Could not start checkout. Try again.");
      setLoading(null);
    }
  }

  return (
    <div className="mt-10">
      {canceled && (
        <p className="mx-auto mb-6 max-w-md rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Checkout canceled. Your card was not charged.
        </p>
      )}

      {/* Interval toggle */}
      <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setInterval("month")}
          aria-pressed={interval === "month"}
          className={
            "rounded-full px-4 py-1.5 text-sm font-medium transition " +
            (interval === "month"
              ? "bg-brand-600 text-white"
              : "text-slate-600 hover:text-slate-900")
          }
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setInterval("year")}
          aria-pressed={interval === "year"}
          className={
            "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition " +
            (interval === "year"
              ? "bg-brand-600 text-white"
              : "text-slate-600 hover:text-slate-900")
          }
        >
          Annual
          <span
            className={
              "rounded-full px-1.5 py-0.5 text-[11px] font-semibold " +
              (interval === "year"
                ? "bg-white/20 text-white"
                : "bg-honey/15 text-amber-700")
            }
          >
            Save up to 40%
          </span>
        </button>
      </div>

      {error && (
        <p className="mx-auto mt-6 max-w-md rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Plan cards */}
      <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key];
          const popular = key === "pro";
          const perMonth = interval === "month" ? plan.monthly : plan.annualMonthly;
          const save = Math.round((1 - plan.annualMonthly / plan.monthly) * 100);
          const busy = loading === key;
          return (
            <div
              key={key}
              className={
                "relative flex flex-col rounded-2xl border bg-white p-7 text-left shadow-card " +
                (popular ? "border-brand-600 ring-1 ring-brand-600" : "border-slate-200")
              }
            >
              {popular && (
                <span className="absolute -top-3 left-7 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}

              <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900">
                  ${perMonth}
                </span>
                <span className="text-sm text-slate-500">/mo</span>
              </div>
              <p className="mt-1 h-5 text-sm text-slate-500">
                {interval === "year"
                  ? `Billed $${annualTotal(plan)}/year · save ${save}%`
                  : "Billed monthly"}
              </p>

              <button
                type="button"
                onClick={() => subscribe(key)}
                disabled={busy}
                className={
                  "mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 " +
                  (popular
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-slate-900 text-white hover:bg-slate-800")
                }
              >
                {busy ? "Starting..." : "Start 14-day free trial"}
              </button>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-slate-700">
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        14-day free trial on every plan. Card required, cancel anytime before it
        ends and you won&apos;t be charged.
      </p>
    </div>
  );
}
