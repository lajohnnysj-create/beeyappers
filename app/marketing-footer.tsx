import Link from "next/link";
import { Wordmark } from "@/app/wordmark";

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="Bleviq home">
            <Wordmark />
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
            <Link href="/pricing" className="transition hover:text-slate-900">
              Pricing
            </Link>
            <Link href="/privacy" className="transition hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-slate-900">
              Terms
            </Link>
            <Link href="/login" className="transition hover:text-slate-900">
              Sign in
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-slate-400">
          © {year} MRLA Media LLC. Bleviq is a product of MRLA Media LLC.
        </p>
      </div>
    </footer>
  );
}
