// Edge-safe. Builds the `frame-ancestors` CSP value that locks a site's widget
// iframe to its own domain and that domain's subdomains. The domain is resolved
// from the public widget key via a SECURITY DEFINER RPC (no table enumeration),
// with a short in-process cache so repeat loads don't re-query.

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { value: string | null; exp: number }>();

// Reduce a stored domain ("ryxa.io", "https://www.ryxa.io/x") to its bare host,
// dropping a leading www so the apex and its subdomains are both covered.
function apexHost(domain: string): string | null {
  const d = (domain || "").trim().toLowerCase();
  if (!d) return null;
  let host: string;
  try {
    host = new URL(/^https?:\/\//.test(d) ? d : "https://" + d).hostname;
  } catch {
    return null;
  }
  if (host.startsWith("www.")) host = host.slice(4);
  if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(host)) return null;
  return host;
}

async function lookupDomain(key: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/get_frame_domain`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_key: key }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data === "string" && data ? data : null;
  } catch {
    return null;
  }
}

// Returns the frame-ancestors source list, or null when there's no domain to
// lock to (in which case the caller leaves embedding unrestricted).
export async function frameAncestorsForKey(key: string): Promise<string | null> {
  if (!key) return null;

  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.exp > now) return hit.value;

  const domain = await lookupDomain(key);
  const host = domain ? apexHost(domain) : null;
  const value = host
    ? `'self' https://${host} https://*.${host} http://${host} http://*.${host}`
    : null;

  cache.set(key, { value, exp: now + TTL_MS });
  return value;
}
