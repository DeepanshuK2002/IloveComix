import { NextResponse } from "next/server";
import { listComixGenres } from "@/lib/comix/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await listComixGenres();
    return NextResponse.json({ data, source: "comix" }, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comix genres failed" },
      { status: 502 }
    );
  }
}