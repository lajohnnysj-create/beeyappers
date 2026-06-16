"use client";

import { useState, useTransition } from "react";
import { createSite } from "./actions";
import { FIELD_LIMITS } from "@/lib/field-limits";
import { siteUrlError } from "@/lib/validate-url";

export function NewSiteForm() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = domain.trim();

    // Validate here and now, before we touch the server or move screens.
    const err = siteUrlError(value);
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    const fd = new FormData();
    fd.set("domain", value);
    startTransition(async () => {
      const res = await createSite(null, fd);
      // On success the action revalidates /dashboard, which swaps in the next
      // screen. Only surface an error if one came back.
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="domain"
          type="text"
          inputMode="url"
          required
          autoFocus
          maxLength={FIELD_LIMITS.domain}
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value);
            if (error) setError(null);
          }}
          aria-label="Your website address"
          placeholder="yourwebsite.com"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110 active:scale-[.98] disabled:opacity-60"
        >
          {pending ? "Starting..." : "Let's Go!"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
