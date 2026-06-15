import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 20;

const REAL_MIN_BYTES = 20_000; // placeholder is small; real shots are larger
const TRIES = 5;
const DELAY_MS = 1800;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function mshots(domain: string): string {
  let d = domain.trim();
  if (!/^https?:\/\//i.test(d)) d = "https://" + d;
  return (
    "https://s.wordpress.com/mshots/v1/" +
    encodeURIComponent(d) +
    "?w=1000&h=625"
  );
}

export async function GET(req: Request) {
  const siteId = new URL(req.url).searchParams.get("siteId") || "";
  if (!siteId) return new NextResponse("Missing siteId", { status: 400 });

  const admin = createAdminClient();
  const { data: site } = await admin
    .from("sites")
    .select("domain")
    .eq("id", siteId)
    .single();
  if (!site?.domain) return new NextResponse("Not found", { status: 404 });

  const url = mshots(site.domain);
  let last: { buf: ArrayBuffer; type: string } | null = null;

  // Poll until WordPress returns the real screenshot rather than its placeholder.
  for (let i = 0; i < TRIES; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        const type = r.headers.get("content-type") || "image/jpeg";
        const buf = await r.arrayBuffer();
        last = { buf, type };
        if (buf.byteLength >= REAL_MIN_BYTES) break;
      }
    } catch {
      /* retry */
    }
    if (i < TRIES - 1) await sleep(DELAY_MS);
  }

  if (!last) return new NextResponse("No preview", { status: 502 });

  const isReal = last.buf.byteLength >= REAL_MIN_BYTES;
  return new NextResponse(Buffer.from(last.buf), {
    status: 200,
    headers: {
      "Content-Type": last.type,
      // Cache real previews; let a placeholder expire fast so it retries.
      "Cache-Control": isReal ? "public, max-age=86400" : "public, max-age=30",
    },
  });
}
