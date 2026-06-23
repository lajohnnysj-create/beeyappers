import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { HomeHero } from "@/app/home-hero";
import { SignupCtas } from "@/app/signup-ctas";
import { BleviqWidget } from "@/app/bleviq-widget";

export const metadata: Metadata = pageMetadata({
  title: "24/7 AI Chatbot that Works While you Sleep | Bleviq",
  description:
    "Bleviq learns your website and answers visitor questions 24/7. Set it up for free in minutes with one line of code.",
  path: "/",
});

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
    body: "Our AI learns your website and trains your chatbot.",
    card: "border-sky-100 bg-sky-50",
    badge: "bg-sky-700",
    img: "/card2.webp",
  },
  {
    n: "03",
    title: "Add knowledge",
    body: "Provide additional information for your chatbot.",
    card: "border-teal-100 bg-teal-50",
    badge: "bg-teal-700",
    img: "/card3.webp",
  },
  {
    n: "04",
    title: "Customize to your branding",
    body: "Match your colors, fonts, and avatar so it feels like you.",
    card: "border-amber-100 bg-amber-50",
    badge: "bg-amber-700",
    img: "/card4.webp",
  },
  {
    n: "05",
    title: "Drop in the widget",
    body: "Copy one script tag onto your site.",
    card: "border-rose-100 bg-rose-50",
    badge: "bg-rose-700",
    img: "/card5.webp",
  },
  {
    n: "06",
    title: "Voila!",
    body: "The chat bubble is now live on your website!",
    card: "border-emerald-100 bg-emerald-50",
    badge: "bg-emerald-700",
    img: "/card6.webp",
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

const ANALYTICS_POINTS = [
  "Messages, conversations, visitors, and leads at a glance.",
  "Spot trends over time, by day or by hour.",
  "See where visitors come from and what they use.",
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

const WORK_FEATURES = [
  {
    img: "/feature-language.webp",
    alt: "Speech bubbles greeting visitors in many languages around a globe",
    title: "Automatically detect language",
    body: "Your chatbot speaks to each visitor in their own language.",
  },
  {
    img: "/feature-leads.webp",
    alt: "Chat flow capturing a visitor's name and email as a lead",
    title: "Collect leads",
    body: "Your chatbot spots interested visitors and collects their contact details.",
  },
  {
    img: "/feature-notify.webp",
    alt: "Email notification showing a new chat from your website",
    title: "Get notified of every chat",
    body: "Get the full conversation emailed to you after each chat ends.",
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
      <SiteHeader signedIn={signedIn} overHero />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <HomeHero />

      {/* Key selling point: the AI expectation, with a live-chat micro-demo */}
      <section className="relative isolate z-10 -mt-12 overflow-hidden rounded-t-[2.5rem] bg-[#070713] sm:-mt-16 sm:rounded-t-[3.5rem]">
        {/* Background: dark futuristic lab, darkened for legibility. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/homepagesplash5.webp"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        {/* Darkening overlays, heavier on the left where the copy sits. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/50" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
        />
        {/* Luminous rim along the rounded top edge so the wrap reads as a clean
            break from the (same-colored) hero above. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 rounded-t-[2.5rem] bg-gradient-to-b from-white/12 to-transparent sm:rounded-t-[3.5rem]"
        />
        {/* Soft bloom straddling the top edge so light appears to spill from the hero. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-3xl"
        />

        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* Copy */}
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l1.9 5.8a2 2 0 0 0 1.3 1.3L21 11l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 20l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 11l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
              </svg>
              The new expectation
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Your visitors expect instant answers
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-slate-300 sm:mx-0">
              As the world shifts to AI, the moment someone lands on your site they
              expect a quick answer, not a wait. Bleviq lets you add that AI to your
              website, easily.
            </p>
          </div>

          {/* Chat micro-demo, matching the real Bleviq widget */}
          <div className="bv-float mx-auto w-full max-w-sm rounded-2xl shadow-2xl ring-1 ring-black/5">
            {/* Header (brand purple) */}
            <div className="flex items-center gap-2.5 rounded-t-2xl bg-brand-600 px-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/agent/1.webp"
                alt=""
                className="h-9 w-9 rounded-[12px] object-cover"
              />
              <span className="flex-1 text-[17px] font-bold tracking-tight text-white">
                AI Assistant
              </span>
              <span aria-hidden="true" className="text-white/80">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </span>
            </div>
            {/* Messages (white body) */}
            <div className="space-y-3 rounded-b-2xl bg-white px-4 pb-4 pt-4">
              {/* Assistant greeting */}
              <div className="flex items-start gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/agent/1.webp"
                  alt=""
                  className="h-[26px] w-[26px] shrink-0 rounded-[8px] object-cover"
                />
                <div className="max-w-[82%] rounded-[18px] rounded-bl-[6px] bg-[#f1f5f9] px-3.5 py-2 text-[15px] leading-snug text-[#0f172a]">
                  Hi! Ask me anything about this site.
                </div>
              </div>
              {/* Visitor question */}
              <div className="flex justify-end">
                <div className="max-w-[82%] rounded-[18px] rounded-br-[6px] bg-[#2563eb] px-3.5 py-2 text-[15px] leading-snug text-white">
                  Do you offer same-day delivery?
                </div>
              </div>
              {/* Assistant answer */}
              <div className="flex items-start gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/agent/1.webp"
                  alt=""
                  className="h-[26px] w-[26px] shrink-0 rounded-[8px] object-cover"
                />
                <div className="max-w-[82%] rounded-[18px] rounded-bl-[6px] bg-[#f1f5f9] px-3.5 py-2 text-[15px] leading-snug text-[#0f172a]">
                  Yes! Same-day delivery is available on orders placed before 2pm.
                </div>
              </div>
              {/* Visitor follow-up */}
              <div className="flex justify-end">
                <div className="max-w-[82%] rounded-[18px] rounded-br-[6px] bg-[#2563eb] px-3.5 py-2 text-[15px] leading-snug text-white">
                  What's your return policy?
                </div>
              </div>
              {/* Assistant thinking */}
              <div className="flex items-start gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/agent/1.webp"
                  alt=""
                  className="h-[26px] w-[26px] shrink-0 rounded-[8px] object-cover"
                />
                <div className="inline-flex items-center gap-2 rounded-[18px] rounded-bl-[6px] bg-[#f1f5f9] px-3.5 py-2.5">
                  <span className="inline-flex items-center gap-1">
                    <span className="bv-typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: "0s" }} />
                    <span className="bv-typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: "0.15s" }} />
                    <span className="bv-typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: "0.3s" }} />
                  </span>
                  <span className="text-[14px] font-medium text-slate-600">Thinking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight text-slate-900">
            Live in a few steps
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-slate-600">
            From training your AI to a live widget on your site, about the time
            it takes to grab a coffee.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="bv-float"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <div
                  className={`group rounded-2xl border p-6 shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-xl ${s.card}`}
                >
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-full text-base font-bold text-white ${s.badge}`}
                  >
                    {s.n}
                  </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-slate-600">{s.body}</p>
                <div className="relative mt-5 overflow-hidden rounded-xl border border-slate-900/5 bg-white shadow-lg ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:ring-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt="" className="block w-full" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[160%] -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-[420%]"
                  />
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard showcase */}
      {/* What it does for you — dark, image-ready background */}
      <section className="relative isolate overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/heropagesplash4.webp"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        {/* Overlays keep the cards and text legible while letting the image show. */}
        <div className="absolute inset-0 -z-10 bg-black/55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/25 to-black/80" />

        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WORK_FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-lg backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.1]"
              >
                <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-lg ring-1 ring-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.img} alt={f.alt} className="block w-full" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[160%] -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-[420%]"
                  />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                <span className="ml-3 hidden flex-1 truncate rounded bg-white px-2 py-0.5 text-[11px] text-slate-500 sm:block">
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
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
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

      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
              Analytics that show what&rsquo;s working
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              See how much your assistant is doing and who it&rsquo;s reaching,
              all in one place and updated as visitors chat.
            </p>
            <ul className="mt-6 space-y-3">
              {ANALYTICS_POINTS.map((p) => (
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

          {/* Tilted desktop mockup (mirrored) */}
          <div className="lg:[perspective:1600px]">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-transform duration-500 lg:[transform:rotateY(9deg)_rotateX(3deg)] lg:hover:[transform:rotateY(0deg)_rotateX(0deg)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 hidden flex-1 truncate rounded bg-white px-2 py-0.5 text-[11px] text-slate-500 sm:block">
                  bleviq.com/dashboard
                </span>
              </div>
              {/* Screenshot */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/analyticsmockup.webp"
                  alt="The Bleviq analytics dashboard: messages, conversations, visitors, and leads, with a trend chart and visitor locations and devices."
                  className="block w-full"
                />
                {/* Pulsing point on the chart peak */}
                <span
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: "64.5%", top: "44%" }}
                  aria-hidden="true"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-indigo-600" />
                  </span>
                </span>
                {/* Floating tooltip echoing the live hover tooltip */}
                <div
                  className="bv-float pointer-events-none absolute"
                  style={{ left: "64.5%", top: "44%" }}
                  aria-hidden="true"
                >
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md">
                    <span className="font-medium text-slate-700">Jun 16</span>
                    <span className="text-slate-500"> &middot; 96 messages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/homepagesplash2.webp"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-slate-950/80" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950/30 to-slate-950" />

        <div className="mx-auto max-w-5xl px-6 py-20 lg:py-24">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight text-white">
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
                <h3 className="mt-4 font-display font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="relative isolate overflow-hidden rounded-3xl bg-slate-950 px-8 py-20 text-center shadow-2xl sm:py-24">
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/homepagesplash3.webp"
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          {/* Darkening scrims for legibility */}
          <div className="absolute inset-0 -z-10 bg-slate-950/82" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/60 to-slate-950/65" />

          <h2 className="font-display text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-4xl">
            Give your site a 24/7 answer desk
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-white/85">
            Train your assistant today and watch it start answering in minutes.
          </p>
          <SignupCtas centered />
        </div>
      </section>
      </main>

      <SiteFooter />
      <BleviqWidget />
    </div>
  );
}
