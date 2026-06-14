import * as cheerio from "cheerio";
import { fetchPage } from "./fetch-page";

// Normalize a user-entered domain into an https origin URL.
export function toOrigin(domain: string): string | null {
  let d = domain.trim();
  if (!d) return null;
  if (!/^https?:\/\//i.test(d)) d = "https://" + d;
  try {
    const u = new URL(d);
    return u.origin;
  } catch {
    return null;
  }
}

async function fromSitemap(origin: string): Promise<string[]> {
  try {
    const res = await fetch(origin + "/sitemap.xml", {
      headers: { "User-Agent": "BeeYappersBot/0.1" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    // Pull <loc> entries without a full XML parser.
    const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(
      (m) => m[1]
    );
    return locs;
  } catch {
    return [];
  }
}

async function fromHomepageLinks(origin: string): Promise<string[]> {
  const html = await fetchPage(origin);
  if (!html) return [origin];
  const $ = cheerio.load(html);
  const urls = new Set<string>([origin]);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const abs = new URL(href, origin);
      if (abs.origin === origin) {
        abs.hash = "";
        urls.add(abs.toString());
      }
    } catch {
      // ignore malformed hrefs
    }
  });
  return [...urls];
}

// Returns a de-duplicated, same-origin list of URLs to crawl, capped at limit.
export async function discoverUrls(
  origin: string,
  limit: number
): Promise<string[]> {
  let urls = await fromSitemap(origin);
  urls = urls.filter((u) => {
    try {
      return new URL(u).origin === origin;
    } catch {
      return false;
    }
  });

  if (urls.length === 0) {
    urls = await fromHomepageLinks(origin);
  }

  const unique = [...new Set(urls)];
  return unique.slice(0, limit);
}
