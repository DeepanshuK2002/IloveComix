import { NextRequest, NextResponse } from "next/server";
import { browseComix } from "@/lib/comix/api";
import { boolParam, csvArray, intParam } from "@/lib/comix/route-util";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const data = await browseComix({
      feed: searchParams.get("feed")?.trim() || undefined,
      sort: searchParams.get("sort")?.trim() || undefined,
      sfw: boolParam(searchParams, "sfw", true),
      contentRating: csvArray(searchParams, "content_rating"),
      page: intParam(searchParams, "page", 1),
      limit: Math.min(intParam(searchParams, "limit", 20), 50),
    });
    return NextResponse.json({ data, source: "comix" }, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comix browse failed" },
      { status: 502 }
    );
  }
}