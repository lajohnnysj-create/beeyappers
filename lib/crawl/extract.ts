import * as cheerio from "cheerio";

export type Extracted = { title: string; text: string };

export function extractContent(html: string): Extracted {
  const $ = cheerio.load(html);

  // Remove everything that is not real content.
  $(
    "script, style, noscript, svg, nav, header, footer, form, iframe, " +
      "[role='navigation'], [aria-hidden='true']"
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
