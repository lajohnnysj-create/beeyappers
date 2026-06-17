import * as cheerio from "cheerio";

export type Extracted = { title: string; text: string };

export function extractContent(html: string): Extracted {
  const $ = cheerio.load(html);

  // Remove non-content boilerplate only. We deliberately KEEP aria-hidden
  // elements: accessible tabs, accordions, and carousels mark their inactive
  // panels aria-hidden="true", and that hidden text is real content the
  // assistant should learn (it was the reason toggled content went missing).
  $(
    "script, style, noscript, svg, nav, header, footer, form, iframe, " +
      "[role='navigation']"
  ).remove();

  const title =
    $("title").first().text().trim() ||
    $("h1").first().text().trim() ||
    "Untitled";

  // Prefer a main/article region; fall back to body.
  const root = $("main").length
    ? $("main")
    : $("article").length
    ? $("article")
    : $("body");

  // Collapse whitespace and drop empty lines.
  const text = root
    .text()
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return { title, text };
}
