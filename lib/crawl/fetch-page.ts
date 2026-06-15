const MAX_BYTES = 2_000_000; // 2 MB cap per page
const TIMEOUT_MS = 12_000;
const UA =
  "BeeYappersBot/0.1 (+https://bee-yappers.example; AI site assistant)";

import { safeFetch } from "./safe-fetch";

export async function fetchPage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await safeFetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html" },
    });

    if (!res || !res.ok) return null;

    const type = res.headers.get("content-type") || "";
    if (!type.includes("text/html")) return null;

    const len = Number(res.headers.get("content-length") || 0);
    if (len && len > MAX_BYTES) return null;

    const html = await res.text();
    if (html.length > MAX_BYTES) return html.slice(0, MAX_BYTES);
    return html;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
