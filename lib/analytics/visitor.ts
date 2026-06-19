// Coarse, privacy-safe visitor attributes derived from request headers at
// answer time. We keep these low-resolution: a 2-letter country code, an
// approximate city (from the edge, never GPS-precise), and broad device and
// browser buckets. No IP is stored anywhere (the raw IP is only used
// transiently for rate limiting and is one-way hashed).

export function countryFromReq(req: Request): string | null {
  // Vercel sets this at the edge. Empty/"XX" on local or unknown.
  const c = req.headers.get("x-vercel-ip-country");
  if (!c || c === "XX") return null;
  return c.toUpperCase().slice(0, 2);
}

export function cityFromReq(req: Request): string | null {
  // Vercel sets this at the edge, URL-encoded (e.g. "San%20Francisco").
  // Empty on local or when the edge can't resolve a city.
  const raw = req.headers.get("x-vercel-ip-city");
  if (!raw) return null;
  let c: string;
  try {
    c = decodeURIComponent(raw);
  } catch {
    c = raw;
  }
  c = c.trim();
  if (!c) return null;
  return c.slice(0, 80);
}

export function deviceFromUA(ua: string | null): string {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(s)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(s)) return "mobile";
  if (/android/.test(s)) return "tablet"; // Android without "mobile" is usually a tablet
  return "desktop";
}

export function browserFromUA(ua: string | null): string {
  if (!ua) return "unknown";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser\//.test(ua)) return "Samsung Internet";
  if (/Firefox\/|FxiOS\//.test(ua)) return "Firefox";
  if (/Chrome\/|CriOS\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return "Safari";
  return "Other";
}
