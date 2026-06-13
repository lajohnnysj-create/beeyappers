"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSite } from "./actions";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Adding..." : "Add site"}
    </button>
  );
}

export function NewSiteForm() {
  const [state, formAction] = useFormState(createSite, null as
    | { error?: string; ok?: string }
    | null);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <h2 className="text-sm font-semibold text-slate-900">Add a site</h2>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          name="name"
          required
          placeholder="Site name (e.g. Acme Support)"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-600"
        />
        <input
          name="domain"
          placeholder="acme.com (optional)"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-600"
        />
        <AddButton />
      </div>

      {state?.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
          {state.ok}
        </p>
      )}
    </form>
  );
}
