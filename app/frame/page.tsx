import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEntitlementByUserId } from "@/lib/billing/entitlement";
import { mergeConfig, DEFAULT_LABELS, type WidgetLabels } from "@/lib/widget-config";
import { getWidgetStrings } from "@/lib/i18n/widget-strings";
import { WidgetFrame } from "../embed/widget-frame";

// Always render fresh so dashboard config changes show up immediately
// (no Next data-cache between requests).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  robots: { index: false, follow: false },
};

// Map CSS px 1:1 to device px inside the iframe so the 16px inputs are a true
// 16px on iOS (no focus-zoom). Pinch-zoom stays enabled for accessibility.
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function FramePage({
  searchParams,
}: {
  searchParams: { key?: string; lang?: string };
}) {
  const key = searchParams.key || "";
  const lang = searchParams.lang || "";
  let config = mergeConfig(null);
  let labels: WidgetLabels = DEFAULT_LABELS;

  if (key) {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("public_widget_config")
      .select("widget_config")
      .eq("widget_key", key)
      .single();
    if (data) config = mergeConfig(data.widget_config);

    // Removing the "Powered by Bleviq" badge is a paid feature. If the site
    // owner isn't on a paid plan, force branding on regardless of their saved
    // setting. This is the source of truth (the dashboard toggle is just UI),
    // so free and canceled accounts can't keep branding hidden.
    const admin = createAdminClient();
    const { data: site } = await admin
      .from("sites")
      .select("id, user_id")
      .eq("widget_key", key)
      .maybeSingle();
    if (site?.user_id) {
      const ent = await getEntitlementByUserId(site.user_id);
      if (!ent.canRemoveBranding) config = { ...config, showBranding: true };
    }

    // Localize the greeting + UI chrome to the visitor's language (cached;
    // English/unknown returns the author's text with no model call). The
    // assistant name stays exactly as written.
    if (site?.id) {
      const t = await getWidgetStrings(site.id, lang, {
        greeting: config.greeting,
        placeholder: DEFAULT_LABELS.placeholder,
        send: DEFAULT_LABELS.send,
        poweredBy: DEFAULT_LABELS.poweredBy,
        askAI: DEFAULT_LABELS.askAI,
        thinking: DEFAULT_LABELS.thinking,
        leadName: DEFAULT_LABELS.leadName,
        leadEmail: DEFAULT_LABELS.leadEmail,
        leadPhone: DEFAULT_LABELS.leadPhone,
        leadSubmit: DEFAULT_LABELS.leadSubmit,
        leadSent: DEFAULT_LABELS.leadSent,
        leadError: DEFAULT_LABELS.leadError,
      });
      config = { ...config, greeting: t.greeting };
      labels = {
        placeholder: t.placeholder,
        send: t.send,
        poweredBy: t.poweredBy,
        askAI: t.askAI,
        thinking: t.thinking,
        leadName: t.leadName,
        leadEmail: t.leadEmail,
        leadPhone: t.leadPhone,
        leadSubmit: t.leadSubmit,
        leadSent: t.leadSent,
        leadError: t.leadError,
      };
    }
  }

  return (
    <>
      {/* The loader's iframe must be see-through outside the widget itself. */}
      <style>{`html,body{background:transparent !important;margin:0;overflow:hidden}`}</style>
      <WidgetFrame widgetKey={key} config={config} labels={labels} lang={lang} />
    </>
  );
}
