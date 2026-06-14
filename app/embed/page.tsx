import { ChatWidget } from "./chat-widget";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedPage({
  searchParams,
}: {
  searchParams: { key?: string };
}) {
  const key = searchParams.key || "";
  return <ChatWidget widgetKey={key} />;
}
