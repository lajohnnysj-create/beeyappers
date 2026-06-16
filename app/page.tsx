import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/app/marketing-header";
import { MarketingFooter } from "@/app/marketing-footer";
import { HomeHero } from "@/app/home-hero";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "24/7 AI Chatbot that Works While you Sleep | Bleviq",
  description:
    "Bleviq learns your website and answers your visitors' questions 24/7. Set it up in minutes with one line of code. 14-day free trial.",
};

const STEPS = [
  {
    n: "01",
    title: "Add your site",
    body: "Paste your website address. That's the whole setup form.",
    card: "border-indigo-100 bg-indigo-50",
    badge: "bg-indigo-600",
  },
  {
    n: "02",
    title: "Bleviq learns it",
    body: "Our AI learns your website and trains your chatbot on responses.",
    card: "border-teal-100 bg-teal-50",
    badge: "bg-teal-600",
  },
  {
    n: "03",
    title: "Drop in the widget",
    body: "Copy one script tag onto your site. The chat bubble is live.",
    card: "border-amber-100 bg-amber-50",
    badge: "bg-amber-500",
  },
];

const FEATURES = [
  {
    title: "Grounded in your content",
    body: "Answers come from your own pages, FAQs, and documents, not generic guesses.",
  },
  {
    title: "Knows when it doesn't know",
    body: "Instead of making something up, it tells visitors it isn't sure and points them onward.",
  },
  {
    title: "Add FAQs & documents",
    body: "Top up its knowledge with answers and files that aren't published on your site.",
  },
  {
    title: "Make it yours",
    body: "Set the colors, fonts, and avatar. On a paid plan, remove Bleviq branding entirely.",
  },
  {
    title: "One-line install",
    body: "A single script tag drops the widget onto any site, no framework required.",
  },
  {
    title: "Built-in guardrails",
    body: "Rate limiting and usage caps keep behavior safe, abuse out, and costs predictable.",
  },
];

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = !!user;

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader signedIn={signedIn} />

      <HomeHero />

      {/* How it works */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Live in three steps
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-slate-600">
            From website to working chat widget in about the time it takes to
            grab a coffee.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className={`rounded-2xl border p-6 shadow-card ${s.card}`}
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-full text-base font-bold text-white ${s.badge}`}
                >
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Answers your visitors can trust
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-slate-600">
          A chatbot is only useful if it&rsquo;s right. Bleviq stays close to
          what your business actually says.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Simple, traffic-based pricing
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Pick a plan by how many replies you need. Every plan starts with a
            14-day free trial.
          </p>
          <div className="mx-auto mt-10 grid max-w-2xl gap-6 text-left sm:grid-cols-2">
            {PLAN_ORDER.map((key) => {
              const plan = PLANS[key];
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {plan.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{plan.tagline}</p>
                  <p className="mt-4">
                    <span className="text-3xl font-bold text-slate-900">
                      ${plan.monthly}
                    </span>
                    <span className="text-slate-500">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {plan.messageCap.toLocaleString()} AI replies
                  </p>
                </div>
              );
            })}
          </div>
          <Link
            href="/pricing"
            className="mt-10 inline-block font-medium text-brand-600 transition hover:text-brand-700"
          >
            Compare plans &rarr;
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-4">
        <div className="rounded-3xl bg-brand-600 px-8 py-14 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Give your site a 24/7 answer desk
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Train your assistant today and watch it start answering in minutes.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-medium text-brand-700 transition hover:bg-brand-50"
          >
            Start your free trial
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
