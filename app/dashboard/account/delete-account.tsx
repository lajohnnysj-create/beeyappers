"use client";

import { useState } from "react";
import { Wordmark } from "@/app/wordmark";
import { deleteAccount } from "./actions";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirm.trim().toUpperCase() === "DELETE";

  function close() {
    if (busy) return;
    setOpen(false);
    setConfirm("");
    setError(null);
  }

  async function run() {
    if (!canDelete) return;
    setBusy(true);
    setError(null);
    // On success the action cancels Stripe, purges data, deletes the auth user,
    // and redirects to /login?deleted=1 — so we only return here on error.
    const res = await deleteAccount(confirm);
    if (res?.error) {
      setError(res.error);
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-slate-900">Delete account</h2>
      <p className="mt-1 text-sm text-slate-600">
        This cancels your Stripe subscription, then permanently deletes your
        account, all your sites, their crawled pages, documents, FAQs, and chat
        history. This cannot be undone.
      </p>

      <button
        onClick={() => setOpen(true)}
        className="mt-4 flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </svg>
        Delete account
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex justify-center">
              <Wordmark />
            </div>

            <h2 className="text-center text-lg font-semibold text-slate-900">
              Delete your account?
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              This cancels your Stripe subscription, then permanently deletes
              your account and every site you own, along with their pages,
              documents, FAQs, and chat history. This cannot be undone.
            </p>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">
                Type <span className="font-semibold">DELETE</span> to confirm
              </span>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoFocus
                placeholder="DELETE"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
              />
            </label>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={close}
                disabled={busy}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={run}
                disabled={!canDelete || busy}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
