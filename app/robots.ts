import type { MetadataRoute } from "next";

// Served at /robots.txt. Marketing pages are crawlable; the app, auth, and API
// routes are not. /frame and /embed are deliberately NOT blocked here: they
// already return a noindex robots meta, which Google can only honor if it is
// allowed to fetch them. Blocking them in robots would hide that signal.
const BASE = "https://www.bleviq.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/login", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
