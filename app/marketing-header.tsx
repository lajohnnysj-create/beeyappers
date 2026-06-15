import Link from "next/link";
import { Wordmark } from "@/app/wordmark";

// Presentational only: the page fetches auth state and passes `signedIn`, so
// this stays a plain (non-async) component and can be nested anywhere.
export function MarketingHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="Bleviq home">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-slate-600 sm:gap-6">
          <Link href="/pricing" className="transition hover:text-slate-900">
            Pricing
          </Link>
          {signedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-600 px-4 py-2 text-white transition hover:bg-brand-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="transition hover:text-slate-900">
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-brand-600 px-4 py-2 text-white transition hover:bg-brand-700"
              >
                Start free trial
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
