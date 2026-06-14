import * as cheerio from "cheerio";
import { fetchPage } from "./fetch-page";

const UA = "BeeYappersBot/0.1";
const TIMEOUT_MS = 10_000;

// Normalize a user-entered domain into an https origin URL.
export function toOrigin(domain: string): string | null {
  let d = domain.trim();
  if (!d) return null;
  if (!/^https?:\/\//i.test(d)) d = "https://" + d;
  try {
    return new URL(d).origin;
  } catch {
    return null;
  }
}

// Host without a leading "www." so apex and www are treated as one site.
function baseHost(host: string): string {
  return host.replace(/^www\./i, "").toLowerCase();
}

function sameSite(url: string, origin: string): boolean {
  try {
    return baseHost(new URL(url).host) === baseHost(new URL(origin).host);
  } catch {
    return false;
  }
}

// Skip assets and non-page resources.
const SKIP_EXT =
  /\.(xml|json|txt|css|js|map|ico|png|jpe?g|gif|webp|svg|avif|pdf|zip|gz|mp4|mp3|woff2?|ttf)(\?|#|$)/i;

function isPageUrl(url: string): boolean {
  return !SKIP_EXT.test(url);
}

function normalize(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    let s = u.toString();
    if (s.endsWith("/")) s = s.slice(0, -1);
    return s;
  } catch {
    return url;
  }
}

async function fetchText(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Pull sitemap URLs declared in robots.txt.
async function sitemapsFromRobots(origin: string): Promise<string[]> {
  const txt = await fetchText(origin + "/robots.txt");
  if (!txt) return [];
  return [...txt.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1].trim());
}

function locsFrom(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
}

// Walk one or more sitemaps (following sitemap-index files) and collect page URLs.
async function collectFromSitemaps(
  sitemapUrls: string[],
  origin: string,
  limit: number
): Promise<string[]> {
  const pages = new Set<string>();
  const queue = [...sitemapUrls];
  let processed = 0;

  while (queue.length > 0 && processed < 25 && pages.size < limit * 3) {
    const sm = queue.shift()!;
    processed++;
    const xml = await fetchText(sm);
    if (!xml) continue;

    const isIndex = /<sitemapindex/i.test(xml);
    const locs = locsFrom(xml);

    if (isIndex) {
      // Child sitemaps to walk next.
      for (const loc of locs) if (sameSite(loc, origin)) queue.push(loc);
    } else {
      for (const loc of locs) {
        if (sameSite(loc, origin) && isPageUrl(loc)) pages.add(normalize(loc));
      }
    }
  }
  return [...pages];
}

// Two-level link discovery for sites without a usable sitemap.
async function fromHomepageLinks(
  origin: string,
  limit: number
): Promise<string[]> {
  const found = new Set<string>([normalize(origin)]);

  function harvestLinks(html: string) {
    const $ = cheerio.load(html);
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      try {
        const abs = new URL(href, origin).toString();
        if (sameSite(abs, origin) && isPageUrl(abs)) found.add(normalize(abs));
      } catch {
        /* ignore */
      }
    });
  }

  const home = await fetchPage(origin);
  if (home) harvestLinks(home);

  // Level 2: expand from a handful of first-level links.
  const seeds = [...found].slice(1, 11);
  for (const seed of seeds) {
    if (found.size >= limit * 2) break;
    const html = await fetchPage(seed);
    if (html) harvestLinks(html);
  }

  return [...found];
}

// Returns a de-duplicated, same-site list of page URLs to crawl, capped.
export async function discoverUrls(
  origin: string,
  limit: number
): Promise<string[]> {
  // 1. Prefer sitemaps (robots.txt, then common locations).
  let sitemaps = await sitemapsFromRobots(origin);
  if (sitemaps.length === 0) {
    sitemaps = [origin + "/sitemap.xml", origin + "/sitemap_index.xml"];
  }

  let pages = await collectFromSitemaps(sitemaps, origin, limit);

  // 2. Fall back to link discovery if sitemaps yielded nothing.
  if (pages.length === 0) {
    pages = await fromHomepageLinks(origin, limit);
  }

  const unique = [...new Set(pages.map(normalize))].filter((u) =>
    isPageUrl(u)
  );
  return unique.slice(0, limit);
}
