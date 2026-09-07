import { NextRequest, NextResponse } from "next/server";
import { getComixCollection } from "@/lib/comix/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numeric = Number.parseInt(id, 10);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return NextResponse.json({ error: "Invalid collection id" }, { status: 400 });
  }
  try {
    const data = await getComixCollection(numeric);
    if (!data) {
      return NextResponse.json({ error: "Collection not found or unavailable" }, { status: 404 });
    }
    return NextResponse.json({ data, source: "comix" }, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=600" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comix collection failed" },
      { status: 502 }
    );
  }
}