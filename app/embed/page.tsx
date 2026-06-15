import { createPublicClient } from "@/lib/supabase/public";
import { mergeConfig } from "@/lib/widget-config";
import { ChatWidget } from "./chat-widget";

// Always render fresh so dashboard config changes show up immediately.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  robots: { index: false, follow: false },
};

// Map CSS px 1:1 to device px inside the iframe, so the 16px chat input is a
// true 16px on iOS and never triggers focus-zoom. Pinch-zoom stays enabled
// (no maximumScale / user-scalable) to keep it accessible.
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function EmbedPage({
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
    <div style={{ height: "100vh" }}>
      <ChatWidget widgetKey={key} config={config} />
    </div>
  );
}
