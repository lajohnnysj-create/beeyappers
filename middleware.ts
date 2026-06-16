import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { frameAncestorsForKey } from "./lib/frame-policy";

export async function middleware(request: NextRequest) {
  const res = await updateSession(request);

  // Lock each site's widget iframe to its own domain (+ subdomains). The whole
  // widget lives in /frame, so a browser that refuses to embed it elsewhere
  // means the widget simply won't appear on unauthorized sites.
  if (request.nextUrl.pathname === "/frame") {
    const key = request.nextUrl.searchParams.get("key") || "";
    const ancestors = await frameAncestorsForKey(key);
    if (ancestors) {
      res.headers.set(
        "Content-Security-Policy",
        `frame-ancestors ${ancestors};`
      );
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Run on everything except static assets, the public API, and the widget.
    "/((?!api|embed|widget.js|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
