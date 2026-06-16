import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/app/marketing-header";
import { MarketingFooter } from "@/app/marketing-footer";
import { HomeHero } from "@/app/home-hero";

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
    img: "/card1.webp",
  },
  {
    n: "02",
    title: "Bleviq learns it",
    body: "Our AI learns your website and trains your chatbot on responses.",
    card: "border-sky-100 bg-sky-50",
    badge: "bg-sky-500",
    img: "/card2.webp",
  },
  {
    n: "03",
    title: "Add knowledge",
    body: "Provide additional information for your chatbot.",
    card: "border-teal-100 bg-teal-50",
    badge: "bg-teal-600",
    img: "/card3.webp",
  },
  {
    n: "04",
    title: "Customize to your branding",
    body: "Match your colors, fonts, and avatar so it feels like you.",
    card: "border-amber-100 bg-amber-50",
    badge: "bg-amber-500",
    img: "/card4.webp",
  },
  {
    n: "05",
    title: "Drop in the widget",
    body: "Copy one script tag onto your site. The chat bubble is live.",
    card: "border-rose-100 bg-rose-50",
    badge: "bg-rose-500",
    img: "/card5.webp",
  },
];

const FEATURES = [
  {
    title: "Grounded in your content",
    body: "Answers come from your own pages, FAQs, and documents.",
    icon: "target",
    tint: "from-indigo-500 to-violet-500",
  },
  {
    title: "Always on",
    body: "It answers visitors around the clock, even while you sleep.",
    icon: "clock",
    tint: "from-sky-500 to-cyan-500",
  },
  {
    title: "Add FAQs & documents",
    body: "Top up its knowledge with answers and files that aren't published on your site.",
    icon: "file",
    tint: "from-teal-500 to-emerald-500",
  },
  {
    title: "Make it yours",
    body: "Set the avatar, colors, fonts, and more.",
    icon: "palette",
    tint: "from-amber-500 to-orange-500",
  },
  {
    title: "One-line install",
    body: "A single script tag drops the widget onto any site, no framework required.",
    icon: "code",
    tint: "from-rose-500 to-pink-500",
  },
  {
    title: "Built-in guardrails",
    body: "Rate limiting and usage caps keep behavior safe, abuse out, and costs predictable.",
    icon: "shield",
    tint: "from-fuchsia-500 to-purple-500",
  },
];

const DASHBOARD_POINTS = [
  "Train, customize, and grab your embed code from one place.",
  "See pages trained and the last-trained time at a glance.",
  "Add documents and FAQs that work instantly and survive re-training.",
];

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function FeatureIcon({ name }: { name: string }) {
  switch (name) {
    case "target":
      return (
        <Glyph>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </Glyph>
      );
    case "clock":
      return (
        <Glyph>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </Glyph>
      );
    case "file":
      return (
        <Glyph>
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v5h5" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </Glyph>
      );
    case "palette":
      return (
        <Glyph>
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10a2 2 0 0 0 2-2 2 2 0 0 0-.5-1.3 2 2 0 0 1-.5-1.2 1.5 1.5 0 0 1 1.5-1.5H16a4 4 0 0 0 4-4c0-4.42-4.48-8-8-8Z" />
        </Glyph>
      );
    case "code":
      return (
        <Glyph>
          <path d="m16 18 6-6-6-6" />
          <path d="m8 6-6 6 6 6" />
        </Glyph>
      );
    case "shield":
      return (
        <Glyph>
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </Glyph>
      );
    default:
      return null;
  }
}

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
            Live in five steps
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-slate-600">
            From website to working chat widget in about the time it takes to
            grab a coffee.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={`group rounded-2xl border p-6 shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-xl ${s.card} ${
                  i === STEPS.length - 1
                    ? "md:col-span-2 md:w-[calc(50%-0.75rem)] md:justify-self-center"
                    : ""
                }`}
              >
                <div
                  className={`bv-float grid h-11 w-11 place-items-center rounded-full text-base font-bold text-white ${s.badge}`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-slate-600">{s.body}</p>
                <div className="mt-5 overflow-hidden rounded-xl border border-slate-900/5 bg-white shadow-lg ring-1 ring-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.img}
                    alt=""
                    className="block w-full transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard showcase */}
      <section className="overflow-hidden border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16">
          {/* Tilted desktop mockup */}
          <div className="lg:[perspective:1600px]">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-transform duration-500 lg:[transform:rotateY(-9deg)_rotateX(3deg)] lg:hover:[transform:rotateY(0deg)_rotateX(0deg)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 hidden flex-1 truncate rounded bg-white px-2 py-0.5 text-[11px] text-slate-400 sm:block">
                  bleviq.com/dashboard
                </span>
              </div>
              {/* Screenshot + roving cursor */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/dashboardmockup.webp"
                  alt="The Bleviq dashboard: train your site, customize the widget, and grab the embed code."
                  className="block w-full"
                />
                <span
                  className="bv-cursor pointer-events-none absolute"
                  style={{ left: "58%", top: "74%" }}
                  aria-hidden="true"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 28 28"
                    style={{ filter: "drop-shadow(0 1px 2px rgba(15,23,42,0.45))" }}
                  >
                    <path
                      d="M5 3l16.5 7.4-6.7 2.2-2.4 6.9z"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Easy-to-use dashboard, powered by AI
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              A simple dashboard that gets the job done, without all the
              headaches.
            </p>
            <ul className="mt-6 space-y-3">
              {DASHBOARD_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-600">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/homepagesplash2.webp"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-slate-950/80" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950/30 to-slate-950" />

        <div className="mx-auto max-w-5xl px-6 py-20 lg:py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Everything your chatbot needs
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-slate-300">
            A chatbot is only useful if it&rsquo;s right. Bleviq stays close to
            what your business actually says.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.08] p-6 shadow-lg backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.12]"
              >
                <div
                  className={`bv-wiggle grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md ${f.tint}`}
                >
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{f.body}</p>
              </div>
            ))}
          </div>
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
