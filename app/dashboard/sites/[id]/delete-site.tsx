"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSite } from "./actions";

export function DeleteSite({
  siteId,
  siteName,
}: {
  siteId: string;
  siteName: string;
}) {
  const router = useRouter();
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
    const res = await deleteSite(siteId);
    if (res?.error) {
      setError(res.error);
      setBusy(false);
      return;
    }
    // Site is gone. Back to the first-run screen.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mt-10 border-t border-slate-200 pt-6">
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-slate-900">Delete this site</p>
          <p className="mt-0.5 text-sm text-slate-600">
            Permanently removes the site and all its training data. Your account
            stays.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
        >
          Delete site
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Delete {siteName}?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This permanently deletes the site, its crawled pages, documents,
              FAQs, and chat history. This cannot be undone. Your account is not
              affected.
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
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

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
                {busy ? "Deleting..." : "Delete site"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
