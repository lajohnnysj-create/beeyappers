import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { mergeConfig } from "@/lib/widget-config";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") || "";
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400, headers: CORS });
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("public_widget_config")
    .select("name, widget_config")
    .eq("widget_key", key)
    .single();

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS });
  }

  return NextResponse.json(
    { name: data.name, config: mergeConfig(data.widget_config) },
    { headers: CORS }
  );
}
