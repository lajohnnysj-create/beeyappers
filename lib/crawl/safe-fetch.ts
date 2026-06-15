import "server-only";
import { promises as dns } from "dns";

// SSRF protection for the crawler. The domain (and any redirect target) is
// attacker-controllable, so before fetching we ensure the host is a public
// http(s) address, not loopback, link-local, cloud-metadata, or a private
// range. DNS is resolved so a public hostname cannot smuggle in a private IP.

const MAX_REDIRECTS = 4;

function ipv4Parts(ip: string): number[] | null {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const p = m.slice(1).map(Number);
  return p.every((n) => n <= 255) ? p : null;
}

function isPrivateIpv4(ip: string): boolean {
  const p = ipv4Parts(ip);
  if (!p) return false;
  const [a, b, c] = p;
  if (a === 0 || a === 127 || a === 10) return true; // this-host, loopback, private
  if (a === 169 && b === 254) return true; // link-local + cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  if (a === 192 && b === 0 && c === 0) return true; // 192.0.0.0/24
  if (a >= 224) return true; // multicast / reserved / broadcast
  return false;
}

function isPrivateIp(addr: string): boolean {
  let ip = addr.trim().toLowerCase().replace(/^\[|\]$/g, "");
  ip = ip.split("%")[0]; // strip IPv6 zone id
  if (ip === "::1" || ip === "::") return true;
  const mapped = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/); // IPv4-mapped IPv6
  if (mapped) return isPrivateIpv4(mapped[1]);
  if (ip.includes(":")) {
    if (/^f[cd]/.test(ip)) return true; // ULA fc00::/7
    if (/^fe[89ab]/.test(ip)) return true; // link-local fe80::/10
    return false; // other global IPv6 allowed (best-effort)
  }
  return isPrivateIpv4(ip);
}

const BLOCKED_HOST =
  /(^|\.)(localhost|local|internal|metadata\.google\.internal)$/i;

export async function isPublicHttpUrl(raw: string): Promise<boolean> {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (!host || BLOCKED_HOST.test(host)) return false;

  // IP literal: check the range directly.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(":")) {
    return !isPrivateIp(host);
  }

  // Hostname: resolve and require every address to be public.
  try {
    const addrs = await dns.lookup(host, { all: true });
    return addrs.length > 0 && addrs.every((a) => !isPrivateIp(a.address));
  } catch {
    return false; // unresolvable -> don't fetch
  }
}

// fetch() with SSRF guards. Validates the initial URL and re-validates every
// redirect hop (redirect handled manually) so a 3xx can't bounce us into a
// private address. Returns null on any policy violation or too many redirects.
export async function safeFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response | null> {
  let current = url;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    if (!(await isPublicHttpUrl(current))) return null;
    const res = await fetch(current, { ...init, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return res;
      try {
        current = new URL(loc, current).toString();
      } catch {
        return null;
      }
      continue;
    }
    return res;
  }
  return null; // redirect loop / too many hops
}
