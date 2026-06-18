// Coarse, privacy-safe visitor attributes derived from request headers at
// answer time. We deliberately keep these low-resolution: a 2-letter country
// code and broad device/browser buckets. No IP is stored anywhere (the raw IP
// is only used transiently for rate limiting and is one-way hashed).

export function countryFromReq(req: Request): string | null {
  // Vercel sets this at the edge. Empty/"XX" on local or unknown.
  const c = req.headers.get("x-vercel-ip-country");
  if (!c || c === "XX") return null;
  return c.toUpperCase().slice(0, 2);
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
