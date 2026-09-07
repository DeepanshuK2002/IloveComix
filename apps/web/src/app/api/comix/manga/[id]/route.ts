import { NextRequest, NextResponse } from "next/server";
import { getComixManga } from "@/lib/comix/api";
import { boolParam } from "@/lib/comix/route-util";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sfw = boolParam(_request.nextUrl.searchParams, "sfw", true);
  try {
    const data = await getComixManga(id, sfw);
    if (!data) {
      return NextResponse.json(
        {
          error: "Comic not found or unavailable",
          hint: "The unofficial Comix API may be temporarily unavailable upstream, the slug may be wrong, or the title is filtered out by the current SFW setting.",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ data, source: "comix" }, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=600" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comix manga failed" },
      { status: 502 }
    );
  }
}