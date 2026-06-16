"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSite } from "./actions";
import type { ActionState } from "@/lib/types";

function GoButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110 active:scale-[.98] disabled:opacity-60"
    >
      {pending ? "Starting..." : "Let's Go!"}
    </button>
  );
}

export function NewSiteForm() {
  const [state, formAction] = useFormState<ActionState, FormData>(createSite, null);

  return (
    <form action={formAction} className="mx-auto w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="domain"
          type="text"
          inputMode="url"
          required
          autoFocus
          aria-label="Your website address"
          placeholder="yourwebsite.com"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        <GoButton />
      </div>
      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
