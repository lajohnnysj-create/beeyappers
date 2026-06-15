import { createPublicClient } from "@/lib/supabase/public";
import { mergeConfig } from "@/lib/widget-config";
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
  searchParams: { key?: string };
}) {
  const key = searchParams.key || "";
  let config = mergeConfig(null);

  if (key) {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("public_widget_config")
      .select("widget_config")
      .eq("widget_key", key)
      .single();
    if (data) config = mergeConfig(data.widget_config);
  }

  return (
    <>
      {/* The loader's iframe must be see-through outside the widget itself. */}
      <style>{`html,body{background:transparent !important;margin:0;overflow:hidden}`}</style>
      <WidgetFrame widgetKey={key} config={config} />
    </>
  );
}
