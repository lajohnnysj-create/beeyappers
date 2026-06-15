import { createPublicClient } from "@/lib/supabase/public";
import { mergeConfig } from "@/lib/widget-config";
import { WidgetFrame } from "../embed/widget-frame";

export const metadata = {
  robots: { index: false, follow: false },
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
