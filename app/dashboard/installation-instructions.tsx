"use client";

import { useState, useEffect, useRef } from "react";

type Platform = {
  name: string;
  abbr: string;
  color: string;
  steps?: string[];
  note?: string;
  supported?: boolean; // defaults true
};

// Step-by-step "where to paste the snippet" guides per platform. Steps refer to
// "your Bleviq snippet" (the embed snippet shown above on the same page).
const PLATFORMS: Platform[] = [
  {
    name: "HTML",
    abbr: "<>",
    color: "#e34f26",
    steps: [
      "Open the HTML file for each page where the chat should appear (or your shared header/footer include).",
      "Paste your Bleviq snippet just before the closing </body> tag.",
      "Save the file and upload it to your web host.",
      "Visit your site to confirm the chat bubble appears.",
    ],
  },
  {
    name: "WordPress",
    abbr: "WP",
    color: "#21759b",
    steps: [
      "In your WordPress admin, go to Plugins → Add New, then install and activate \"WPCode\" (or \"Insert Headers and Footers\").",
      "Open the plugin (Code Snippets → Header & Footer, or Settings → Insert Headers and Footers).",
      "Paste your Bleviq snippet into the \"Footer\" box.",
      "Click Save. The widget now loads on every page.",
    ],
    note: "On a block theme you can instead use Appearance → Editor, or paste the snippet before </body> in your theme's footer.php.",
  },
  {
    name: "Shopify",
    abbr: "Sh",
    color: "#5a8a3c",
    steps: [
      "From your Shopify admin, go to Online Store → Themes.",
      "On your current theme, click the \"...\" menu and choose \"Edit code.\"",
      "In the \"Layout\" folder, open theme.liquid.",
      "Paste your Bleviq snippet just before the closing </body> tag.",
      "Click Save.",
    ],
  },
  {
    name: "Wix",
    abbr: "Wx",
    color: "#0c6efc",
    steps: [
      "Go to your Wix dashboard and open Settings.",
      "Click \"Custom Code\" (under the Advanced section).",
      "Click \"+ Add Custom Code\" at the top right.",
      "Paste your Bleviq snippet and give it a name like \"Bleviq.\"",
      "Under \"Add Code to Pages,\" choose \"All pages,\" and set \"Place Code in\" to \"Body - end.\"",
      "Click Apply.",
    ],
    note: "Custom Code requires a Premium plan with a connected domain.",
  },
  {
    name: "Squarespace",
    abbr: "Sq",
    color: "#111111",
    steps: [
      "In your Squarespace dashboard, go to Settings → Advanced → Code Injection.",
      "Paste your Bleviq snippet into the \"Footer\" box.",
      "Click Save.",
    ],
    note: "Code Injection requires a Business or Commerce plan.",
  },
  {
    name: "GoDaddy",
    abbr: "GD",
    color: "#00838a",
    steps: [
      "Sign in to GoDaddy, go to \"My Products,\" and click \"Edit Website\" on your Websites + Marketing site.",
      "Go to the page where you want the chat, then click \"Add Section.\"",
      "Search for and add the \"HTML\" section.",
      "Paste your Bleviq snippet into the custom code field.",
      "Publish your site.",
    ],
    note: "GoDaddy's current Website Builder has no site-wide code field, so add the HTML section to each page you want the widget on. If your site is GoDaddy-hosted WordPress or HTML hosting instead, use that platform's steps.",
  },
  {
    name: "Webflow",
    abbr: "Wf",
    color: "#4353ff",
    steps: [
      "In the Webflow Designer, open your project's Site settings.",
      "Go to the \"Custom code\" tab.",
      "Paste your Bleviq snippet into the \"Footer Code\" box (this loads it before </body>).",
      "Click Save Changes, then publish your site.",
    ],
    note: "Site-wide custom code requires a paid Site plan.",
  },
  {
    name: "Google Sites",
    abbr: "GS",
    color: "#3367d6",
    supported: false,
    note: "Google Sites only allows embedded code inside a contained, sandboxed block on a page, and does not support site-wide floating widgets. The Bleviq chat bubble cannot be installed on Google Sites. Consider linking visitors to a Bleviq-enabled page, or using a platform that allows site-wide code.",
  },
  {
    name: "Joomla",
    abbr: "J",
    color: "#4a7ba6",
    steps: [
      "Log in to your Joomla administrator.",
      "Go to System → Site Templates (or Extensions → Templates → Templates) and open your active template.",
      "Edit the index.php file.",
      "Paste your Bleviq snippet just before the closing </body> tag, then Save.",
    ],
    note: "Alternatively, create a \"Custom HTML\" module placed in a site-wide position, with the editor's code-cleaning disabled so the script isn't stripped.",
  },
  {
    name: "Drupal",
    abbr: "Dr",
    color: "#0678be",
    steps: [
      "In your theme folder, open templates/html.html.twig (copy it from the core \"stable\" theme if your theme doesn't have one).",
      "Paste your Bleviq snippet just before the closing </body> tag.",
      "Clear caches at Configuration → Development → Performance → \"Clear all caches.\"",
    ],
    note: "Prefer not to edit templates? Install the \"Asset Injector\" module and add the snippet there instead.",
  },
  {
    name: "BigCommerce",
    abbr: "BC",
    color: "#34313f",
    steps: [
      "From your BigCommerce control panel, go to Storefront → Script Manager.",
      "Click \"Create a Script.\"",
      "Name it \"Bleviq,\" set \"Location on page\" to \"Footer,\" and \"Pages\" to \"All pages.\"",
      "Set \"Script type\" to \"Script,\" and paste your Bleviq snippet into the box.",
      "Click Save.",
    ],
  },
  {
    name: "Weebly",
    abbr: "Wb",
    color: "#2a5bd7",
    steps: [
      "In the Weebly editor, go to Settings → SEO.",
      "Scroll to the \"Footer Code\" box.",
      "Paste your Bleviq snippet there.",
      "Click Save, then publish your site.",
    ],
  },
  {
    name: "Unbounce",
    abbr: "Un",
    color: "#e35c00",
    steps: [
      "Open your landing page in the Unbounce builder.",
      "Click \"Javascripts\" at the bottom of the page (or Page properties → Javascripts).",
      "Click \"Add a Javascript\" and name it \"Bleviq.\"",
      "Paste your Bleviq snippet and set Placement to \"Before Body End Tag.\"",
      "Click Save, then republish the page.",
    ],
  },
  {
    name: "Framer",
    abbr: "Fr",
    color: "#0055ff",
    steps: [
      "In your Framer project, open Project Settings (the gear icon) → General.",
      "Scroll to the \"Custom Code\" section.",
      "Paste your Bleviq snippet into the \"End of <body> tag\" box.",
      "Publish your site.",
    ],
  },
  {
    name: "Duda",
    abbr: "Du",
    color: "#149c5e",
    steps: [
      "Open your site in the Duda editor.",
      "Click Settings, then \"Header HTML.\"",
      "Paste your Bleviq snippet into the field.",
      "Click Save, then republish your site.",
    ],
  },
  {
    name: "Ghost",
    abbr: "Gh",
    color: "#15171a",
    steps: [
      "In Ghost admin, go to Settings → Code injection.",
      "Paste your Bleviq snippet into the \"Site Footer\" box.",
      "Click Save.",
    ],
  },
  {
    name: "Blogger",
    abbr: "Bl",
    color: "#e8642a",
    steps: [
      "In Blogger, open Theme from the left menu.",
      "Click the arrow next to \"Customize,\" then choose \"Edit HTML.\"",
      "Find the closing </body> tag.",
      "Paste your Bleviq snippet just before it, then click Save.",
    ],
  },
  {
    name: "Tumblr",
    abbr: "Tu",
    color: "#36465d",
    steps: [
      "On your Tumblr dashboard, open your blog's settings, then \"Edit appearance\" → \"Edit theme.\"",
      "Click \"Edit HTML.\"",
      "Paste your Bleviq snippet just before the closing </body> tag.",
      "Click \"Update Preview,\" then \"Save.\"",
    ],
  },
  {
    name: "Yola",
    abbr: "Yo",
    color: "#008f4c",
    steps: [
      "In Yola (Sitebuilder+), click the Main menu button (top left), then Settings.",
      "Open the \"Custom Code\" tab.",
      "In the \"Body\" (or \"Footer\") area, create a new snippet, name it \"Bleviq,\" and paste your snippet.",
      "Click Submit, then publish your site.",
    ],
    note: "Custom code may require an eligible plan.",
  },
  {
    name: "Cargo",
    abbr: "Ca",
    color: "#111111",
    steps: [
      "Open the Custom HTML editor — in Cargo 3: Site Settings → \"CSS/HTML\" → the \"HTML\" tab; in Cargo 2: the \"Design\" tab.",
      "Paste your Bleviq snippet (it's a <script> tag, which Cargo supports).",
      "Click Update/Save. It applies to every page automatically.",
    ],
  },
  {
    name: "Piwigo",
    abbr: "Pi",
    color: "#d96b00",
    steps: [
      "In your Piwigo admin, go to Plugins → Manage and activate the \"LocalFiles Editor\" plugin.",
      "Open Plugins → LocalFiles Editor (or Specials → LocalFiles Editor).",
      "Create a header/footer template override for your active theme (based on header.tpl), and paste your Bleviq snippet near the end.",
      "Save.",
    ],
    note: "Piwigo is self-hosted, so this needs theme/template access and exact steps vary by theme. You can also add a local_head.tpl file containing the snippet to your theme folder.",
  },
  {
    name: "LiveJournal",
    abbr: "LJ",
    color: "#0091c2",
    supported: false,
    note: "LiveJournal strips JavaScript and embed tags from journals for security reasons, so the Bleviq widget cannot be installed there.",
  },
  {
    name: "Jigsy",
    abbr: "Ji",
    color: "#3f7cb8",
    steps: [
      "In the Jigsy Website Editor, click \"Add Content to Page\" (or \"Add to Page\") on the toolbar.",
      "Add the \"HTML\" component to your page.",
      "Click \"Edit\" on the HTML component and paste your Bleviq snippet.",
      "Save.",
    ],
    note: "The HTML component is added per page, so add it on each page where you want the widget (or on a shared block if your template has one).",
  },
  {
    name: "IM Creator",
    abbr: "IM",
    color: "#1591c9",
    steps: [
      "In the IM Creator / XPRS editor, open the \"Site Header code\" editor in your site settings.",
      "Paste your Bleviq snippet there so it loads site-wide.",
      "Save and publish.",
    ],
    note: "Alternatively, add a per-page \"HTML\" element via \"Add an Element → HTML\" and paste the snippet.",
  },
];

function PlatformIcon({ abbr, color }: { abbr: string; color: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
      style={{ background: color }}
    >
      {abbr}
    </span>
  );
}

function InstructionsModal({
  platform,
  onClose,
}: {
  platform: Platform;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative shrink-0 border-b border-slate-100 px-6 pb-4 pt-6 text-center">
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Bleviq" className="mx-auto h-7 w-auto" />
          <h3
            id="install-modal-title"
            className="mt-3 text-base font-semibold text-slate-900"
          >
            Installation instructions for {platform.name}
          </h3>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {platform.supported === false ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-relaxed text-amber-900">{platform.note}</p>
            </div>
          ) : (
            <>
              <ol className="space-y-3">
                {(platform.steps || []).map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-slate-700">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              {platform.note && (
                <p className="mt-4 flex gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span>{platform.note}</span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function InstallationInstructions() {
  const [selected, setSelected] = useState<Platform | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Installation Instructions
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pick your platform for step-by-step setup. Each guide shows exactly where
            to paste the snippet above.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {PLATFORMS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setSelected(p)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <PlatformIcon abbr={p.abbr} color={p.color} />
            <span className="min-w-0 truncate text-sm font-medium text-slate-800">
              {p.name}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <InstructionsModal platform={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
