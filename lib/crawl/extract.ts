import * as cheerio from "cheerio";

export type Extracted = { title: string; text: string };

export function extractContent(html: string): Extracted {
  const $ = cheerio.load(html);

  // Strip technical noise and navigation menus only. We KEEP <header>/<footer>
  // containers and aria-hidden elements on purpose: footers carry real business
  // info (hours, address, contact), and accessible tabs/accordions/carousels
  // mark their inactive panels aria-hidden. Removing <nav> drops the actual
  // menus wherever they sit (including inside header/footer), so the chrome goes
  // without taking real content with it.
  $(
    "script, style, noscript, svg, iframe, form, nav, [role='navigation']"
  ).remove();

  const title =
    $("title").first().text().trim() ||
    $("h1").first().text().trim() ||
    "Untitled";

  // Prefer the primary content region, but always also capture the footer,
  // since business hours / address / contact often live only there and sit
  // outside <main>. When there's no semantic main/article, read the whole body.
  const main = $("main").length
    ? $("main")
    : $("article").length
    ? $("article")
    : null;

  let raw: string;
  if (main) {
    const footer = $("footer").text().trim();
    raw = footer ? main.text() + "\n\n" + footer : main.text();
  } else {
    raw = $("body").text();
  }

  const text = raw
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return { title, text };
}
