import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { BleviqWidget } from "@/app/bleviq-widget";
import { SignupCtas } from "@/app/signup-ctas";

export const metadata: Metadata = pageMetadata({
  title: "About Bleviq: Bringing Everyday Websites Into the Age of AI",
  description:
    "Bleviq was built by Johnny La, a digital marketer of more than twenty years, to help everyday and local businesses add AI to their websites. Here is the story.",
  path: "/about",
});

export default async function AboutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={!!user} />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* Header */}
        <section className="mx-auto max-w-3xl px-6 pt-12 lg:pt-16">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            About
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Bringing everyday websites into the age of AI
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            For more than twenty years I have helped businesses get found online
            and get chosen. Bleviq is what happens when that work meets AI.
          </p>
        </section>

        {/* Founder photo */}
        <section className="mx-auto mt-10 max-w-4xl px-6">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/johnny-la.webp"
              alt="Johnny La, founder of Bleviq"
              className="aspect-[1200/628] w-full rounded-3xl object-cover shadow-card"
            />
            <figcaption className="mt-3 text-center text-sm text-slate-500">
              Johnny La, founder of Bleviq
            </figcaption>
          </figure>
        </section>

        {/* Story */}
        <section className="mx-auto mt-12 max-w-3xl px-6">
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-slate-700">
            <p>
              I am Johnny La, and I have spent over two decades in digital
              marketing: building websites, running search and ads, and helping
              local businesses compete with companies many times their size.
              Most of the people I work with do not run tech companies. They run
              dental practices, shops, studios, and service businesses, each with
              a website that needs to work harder for them.
            </p>
            <p>
              As AI moved from a buzzword into something people use every day,
              the questions from my clients changed. They were not asking for
              another redesign. They were asking how to modernize, how to keep
              up, how to make their website feel as smart and responsive as the
              apps their customers already use everywhere else. "Can my site do
              that too?" became the most common thing I heard.
            </p>
            <p>
              The trouble was that the tools to answer visitors instantly, the
              kind big companies were quietly rolling out, were out of reach for
              the ordinary, local websites I had spent my career serving. They
              were too expensive, too technical, or built for engineering teams
              that no small business has down the hall. There was a gap, and it
              was widening.
            </p>

            <blockquote className="border-l-4 border-brand-300 pl-5 text-xl font-medium leading-snug text-slate-900">
              Big companies got AI first. Bleviq is how everyone else catches up.
            </blockquote>

            <p>
              That was the calling. I built Bleviq so any business can add an AI
              chatbot that learns its own website and answers visitors around the
              clock, with one line of code and no engineering team required. The
              goal is simple: bring the websites that run real, everyday
              businesses into the age of AI, without the enterprise price tag or
              the complexity.
            </p>
            <p>
              Bleviq is built and run under MRLA Media, the company I have grown
              over those twenty years. I get to keep doing what I have always
              done, helping good businesses look great and get chosen, now with a
              tool I wish I had the whole time.
            </p>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="font-display text-lg font-bold tracking-tight text-slate-900">
              Johnny La
            </p>
            <p className="text-sm text-slate-500">Founder, Bleviq</p>
          </div>
        </section>

        {/* CTA band */}
        <section className="mt-16 bg-[#070713]">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Add a free AI chatbot to your site
            </h2>
            <p className="mx-auto mt-3 max-w-md text-slate-300">
              Train it on your website in minutes and let it answer your
              visitors. Free to start, no credit card required.
            </p>
            <div className="mt-7">
              <SignupCtas centered />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BleviqWidget />
    </div>
  );
}
