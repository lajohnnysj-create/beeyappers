import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { pageMetadata } from "@/lib/seo";
import { DoNotShareControls } from "./controls";

export const metadata: Metadata = pageMetadata({
  title: "Do Not Sell or Share My Personal Information | Bleviq",
  description:
    "Your California privacy rights on Bleviq. Opt out of analytics sharing on this device. We do not sell your personal information.",
  path: "/do-not-share",
});

const h2 = "text-lg font-semibold tracking-tight text-slate-900";

export default async function DoNotSharePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={!!user} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-6 py-16 focus:outline-none"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          California Privacy Rights
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Do Not Sell or Share My Personal Information
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: June 17, 2026</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-slate-700">
          <p>
            Under the California Consumer Privacy Act (CCPA) and California
            Privacy Rights Act (CPRA), you have the right to opt out of the sale
            or sharing of your personal information.
          </p>

          <section>
            <h2 className={h2}>What does Bleviq share, and with whom?</h2>
            <p className="mt-3">
              Bleviq does not sell personal information to data brokers,
              advertisers, or any third party for money or any other valuable
              consideration. We do not use advertising cookies, retargeting
              pixels, or cross-site tracking.
            </p>
            <p className="mt-3">
              However, we do use Google Analytics 4 to understand how visitors
              use Bleviq. Under California law, the data Google Analytics
              receives, including pages viewed, time on site, approximate
              location, and a unique identifier, is considered a form of sharing
              personal information with a third party. We want to be transparent
              about that.
            </p>
          </section>

          <section>
            <h2 className={h2}>Opt out below</h2>
            <p className="mt-3">
              You can opt out of analytics sharing on this device at any time.
              This will prevent Google Analytics from loading on Bleviq pages on
              this device, in this browser. The setting is stored locally in your
              browser, so if you clear your browser data or use a different
              device or browser, you will need to opt out again there.
            </p>
            <DoNotShareControls />
          </section>

          <section>
            <h2 className={h2}>Global Privacy Control</h2>
            <p className="mt-3">
              Bleviq also honors the Global Privacy Control (GPC) browser signal.
              If your browser sends a GPC header, Bleviq will treat that as an
              opt-out request automatically and will not load Google Analytics,
              regardless of the setting on this page.
            </p>
          </section>

          <section>
            <h2 className={h2}>Other rights</h2>
            <p className="mt-3">
              You also have the right to know what personal information we
              collect, the right to delete your personal information, the right
              to correct inaccurate information, and the right to limit the use
              of sensitive personal information. For details and to exercise
              these rights, see our{" "}
              <Link
                href="/privacy"
                className="font-medium text-brand-600 underline"
              >
                Privacy Policy
              </Link>{" "}
              or email{" "}
              <a
                href="mailto:johnnyla@mrla-media.com"
                className="font-medium text-brand-600 underline"
              >
                johnnyla@mrla-media.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
