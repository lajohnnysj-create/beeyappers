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

// Small "i" affordance with a tooltip that appears on hover AND keyboard focus
// (hover-only would fail WCAG 1.4.13). The full text is also the button's
// aria-label so screen-reader users get it without needing the visual popover.
function InfoTip({ label }: { label: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        onMouseDown={(e) => e.preventDefault()}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold leading-none text-slate-500 transition hover:border-slate-400 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
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

              <p className="mt-2 text-center text-xs text-slate-500">
                Renews automatically until you cancel.
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-slate-700">
                    <Check />
                    <span className="inline-flex items-center gap-1.5">
                      {f}
                      {/replies/i.test(f) && (
                        <InfoTip label="Reply limits are measured over a rolling 30-day window." />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-slate-600">
        Every plan starts with a 14-day free trial. We save your card now but
        don&apos;t charge it during the trial. When the trial ends, your plan
        renews automatically at the price shown,{" "}
        {interval === "year" ? "billed once a year" : "billed every month"}, and
        continues until you cancel. You can cancel anytime from Settings &rarr;
        Billing, including before the trial ends to avoid any charge. By starting
        a trial you agree to our{" "}
        <a href="/terms" className="font-medium text-brand-600 underline">
          Terms
        </a>{" "}
        and authorize this recurring charge.
      </p>
    </div>
  );
}
