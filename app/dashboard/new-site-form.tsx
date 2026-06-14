"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSite } from "./actions";
import type { ActionState } from "@/lib/types";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 active:scale-[.99] disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create site"}
    </button>
  );
}

export function NewSiteForm() {
  const [state, formAction] = useFormState<ActionState, FormData>(createSite, null);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Site name</span>
          <input
            name="name"
            required
            placeholder="Acme Support"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Website</span>
          <input
            name="domain"
            placeholder="acme.com"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
          <span className="mt-1 block text-xs text-slate-500">
            We will crawl this site to train the assistant. You can add it later.
          </span>
        </label>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <AddButton />
      </div>
    </form>
  );
}
