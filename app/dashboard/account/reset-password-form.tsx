"use client";

import { useState } from "react";
import { changePassword } from "./actions";
import { FIELD_LIMITS } from "@/lib/field-limits";

export function ResetPasswordForm() {
  const [expanded, setExpanded] = useState(false);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);

  const tooShort = pw.length > 0 && pw.length < 8;
  const mismatch = confirm.length > 0 && confirm !== pw;
  const canSubmit = pw.length >= 8 && confirm === pw && !busy;

  function open() {
    setExpanded(true);
    setMsg(null);
  }

  function cancel() {
    if (busy) return;
    setExpanded(false);
    setPw("");
    setConfirm("");
    setMsg(null);
  }

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setMsg(null);
    const res = await changePassword(pw);
    setBusy(false);
    if (res?.error) {
      setMsg({ error: res.error });
      return;
    }
    setMsg({ ok: res?.ok || "Password updated." });
    setPw("");
    setConfirm("");
    setExpanded(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-slate-900">Reset password</h2>
      <p className="mt-1 text-sm text-slate-600">
        Set a new password for your account. You stay signed in on this device.
      </p>

      {/* Success message persists after the fields collapse. */}
      {msg?.ok && !expanded && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          {msg.ok}
        </p>
      )}

      {!expanded ? (
        <button
          type="button"
          onClick={open}
          aria-expanded={false}
          className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Reset password
        </button>
      ) : (
        <div className="mt-4 max-w-sm space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              New password
            </span>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
              autoFocus
              placeholder="At least 8 characters"
              maxLength={FIELD_LIMITS.password}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
            />
            {tooShort && (
              <span className="mt-1 block text-xs text-slate-600">
                Must be at least 8 characters.
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Confirm new password
            </span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="Re-enter password"
              maxLength={FIELD_LIMITS.password}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
            />
            {mismatch && (
              <span className="mt-1 block text-xs text-red-600">
                Passwords don&apos;t match.
              </span>
            )}
          </label>

          {msg?.error && (
            <p role="alert" className="text-sm text-red-600">
              {msg.error}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Updating..." : "Update password"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
