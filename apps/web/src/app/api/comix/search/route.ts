import { NextRequest, NextResponse } from "next/server";
import { searchComix } from "@/lib/comix/api";
import { boolParam, csvArray, intParam } from "@/lib/comix/route-util";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing required query parameter: q" }, { status: 400 });
  }

  try {
    const data = await searchComix(q, {
      sfw: boolParam(searchParams, "sfw", true),
      page: intParam(searchParams, "page", 1),
      limit: Math.min(intParam(searchParams, "limit", 20), 50),
      types: csvArray(searchParams, "types"),
      status: searchParams.get("status")?.trim() || undefined,
      genres: csvArray(searchParams, "genres"),
      contentRating: csvArray(searchParams, "content_rating"),
    });
    return NextResponse.json(
      { data, source: "comix", sfw: boolParam(searchParams, "sfw", true) },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
          "X-Manga-Source": "unofficial comix api (comix-api.vercel.app)",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comix search failed" },
      { status: 502 }
    );
  }
}