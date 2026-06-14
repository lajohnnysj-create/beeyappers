import { createPublicClient } from "@/lib/supabase/public";
import { mergeConfig } from "@/lib/widget-config";
import { ChatWidget } from "./chat-widget";

export const metadata = {
  robots: { index: false, follow: false },
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

  return <ChatWidget widgetKey={key} config={config} />;
}
