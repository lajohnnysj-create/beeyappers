"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function SettingsMenu({
  email,
  used,
  cap,
  planLabel,
  status,
  active,
}: {
  email: string;
  used: number;
  cap: number;
  planLabel: string | null;
  status: string;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function openPortal() {
    setPortalBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
    } catch {
      /* fall through */
    }
    setPortalBusy(false);
  }

  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-brand-600";
  const remaining = Math.max(0, cap - used);

  // Friendly plan label for the menu header.
  const planText = active
    ? `${planLabel}${status === "trialing" ? " · Trial" : ""}`
    : status === "past_due"
      ? "Payment past due"
      : "No active plan";

  // Only open the Stripe portal when there's a real subscription to manage.
  // A stray customer with no subscription (abandoned checkout) goes to /pricing.
  const canManage = ["trialing", "active", "past_due", "unpaid", "paused"].includes(
    status
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Settings"
        aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Account
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
              {email}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Plan</span>
              <span
                className={
                  "text-sm font-medium " +
                  (active ? "text-slate-900" : "text-amber-600")
                }
              >
                {planText}
              </span>
            </div>

            {active && (
              <>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Messages</span>
                  <span className="text-xs tabular-nums text-slate-500">
                    {used.toLocaleString()} / {cap.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  {remaining.toLocaleString()} left (rolling 30 days)
                </p>
              </>
            )}

            {canManage ? (
              <button
                type="button"
                onClick={openPortal}
                disabled={portalBusy}
                className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {portalBusy ? "Opening..." : "Manage billing"}
              </button>
            ) : (
              <Link
                href="/pricing"
                className="mt-3 block w-full rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Choose a plan
              </Link>
            )}
          </div>

          <Link
            href="/dashboard/account"
            onClick={() => setOpen(false)}
            className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Account settings
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
