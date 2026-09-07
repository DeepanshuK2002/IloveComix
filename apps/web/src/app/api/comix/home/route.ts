import { NextResponse } from "next/server";
import { getComixHome } from "@/lib/comix/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getComixHome();
    if (!data) {
      return NextResponse.json({ error: "Comix home feed unavailable" }, { status: 503 });
    }
    return NextResponse.json({ data, source: "comix" }, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comix home failed" },
      { status: 502 }
    );
  }
}