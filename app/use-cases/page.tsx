import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { BleviqWidget } from "@/app/bleviq-widget";
import { USE_CASES } from "./use-cases-data";
import { UCIcon } from "./icons";

export const metadata = pageMetadata({
  title: "AI Chatbot Use Cases by Industry | Bleviq",
  description:
    "See how an AI chatbot trained on your website answers visitors and captures leads, from customer support and ecommerce to dental, real estate, and more.",
  path: "/use-cases",
});

export default async function UseCasesHub() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={!!user} />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <section className="relative isolate overflow-hidden bg-[#070713]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[80%] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-600/20 blur-3xl"
          />
          <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:py-24">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              One chatbot, every kind of website
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              Bleviq trains on your own site, so it fits whatever you do. Find
              your use case and see how it answers visitors and captures leads.
            </p>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((u) => (
                <Link
                  key={u.slug}
                  href={`/use-cases/${u.slug}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"
                >
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: u.accent }}
                    aria-hidden="true"
                  >
                    <UCIcon name={u.icon} className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 font-display text-lg font-semibold text-slate-900">
                    {u.name}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {u.subhead}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    Learn more
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BleviqWidget />
    </div>
  );
}
