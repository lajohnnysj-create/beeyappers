import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { BleviqWidget } from "@/app/bleviq-widget";
import { SignupCtas } from "@/app/signup-ctas";
import { USE_CASES, getUseCase } from "../use-cases-data";
import { UCIcon } from "../icons";

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const uc = getUseCase(params.slug);
  if (!uc) return {};
  return pageMetadata({
    title: uc.metaTitle,
    description: uc.metaDescription,
    path: `/use-cases/${uc.slug}`,
  });
}

// Shared across every use case.
const STEPS = [
  {
    n: 1,
    title: "Train",
    body: "Enter your website URL. Bleviq reads your pages and learns your content.",
  },
  {
    n: 2,
    title: "Customize",
    body: "Pick your colors and a greeting so the widget matches your brand.",
  },
  {
    n: 3,
    title: "Embed",
    body: "Paste one snippet into your site, and you are live.",
  },
];

const FEATURES = [
  {
    icon: "site",
    title: "Trained on your site",
    body: "Answers come from your own pages, not generic guesswork.",
  },
  {
    icon: "funnel",
    title: "Captures leads",
    body: "Spots interested visitors and collects their contact details.",
  },
  {
    icon: "languages",
    title: "Speaks every language",
    body: "Detects and replies in each visitor's own language.",
  },
  {
    icon: "mail",
    title: "Emails you transcripts",
    body: "Every conversation lands in your inbox after it ends.",
  },
  {
    icon: "palette",
    title: "Matches your brand",
    body: "Set the colors so it feels native to your site.",
  },
  {
    icon: "bolt",
    title: "Live in minutes",
    body: "One snippet, no code, no developer required.",
  },
];

export default async function UseCasePage({
  params,
}: {
  params: { slug: string };
}) {
  const uc = getUseCase(params.slug);
  if (!uc) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: uc.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={!!user} />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-[#070713]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[80%] -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl"
            style={{ backgroundColor: uc.accent + "26" }}
          />
          <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/85">
              <UCIcon name={uc.icon} className="h-4 w-4" />
              {uc.eyebrow}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {uc.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              {uc.subhead}
            </p>
            <SignupCtas centered />
            <p className="mt-4 text-sm text-slate-400">
              Free to start. No credit card required.
            </p>
          </div>
        </section>

        {/* Questions visitors keep asking */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900">
              What your {uc.audience} keep asking
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
              {uc.intro}
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uc.questions.map((q) => (
                <div
                  key={q}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: uc.accent + "14", color: uc.accent }}
                    aria-hidden="true"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M9.5 9a2.5 2.5 0 0 1 4.4 1.5c0 1.7-2.4 2-2.4 2.5" />
                      <path d="M12 16h.01" />
                    </svg>
                  </span>
                  <p className="pt-1.5 text-slate-800">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Bleviq helps [industry] */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900">
              How Bleviq helps {uc.helps}
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {uc.benefits.map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: uc.accent }}
                    aria-hidden="true"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-slate-600">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900">
              Live in a few steps
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-slate-600">
              From training to a live widget on your site, about the time it
              takes to grab a coffee.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-base font-bold text-white">
                    {s.n}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-slate-600">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900">
              Everything you need, built in
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <UCIcon name={f.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900">
              {uc.name} chatbot FAQ
            </h2>
            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {uc.faqs.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-medium text-slate-900 marker:content-['']">
                    {f.q}
                    <svg
                      className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-[#070713]">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to answer your {uc.audience} automatically?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-slate-300">
              Train Bleviq on your site and add it in minutes.
            </p>
            <SignupCtas centered />
            <p className="mt-4 text-sm text-slate-400">
              Free to start. No credit card required.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BleviqWidget />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </div>
  );
}
