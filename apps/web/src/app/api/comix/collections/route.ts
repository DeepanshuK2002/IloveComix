import { NextRequest, NextResponse } from "next/server";
import { listComixCollections } from "@/lib/comix/api";
import { intParam } from "@/lib/comix/route-util";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const data = await listComixCollections({
      page: intParam(searchParams, "page", 1),
      limit: Math.min(intParam(searchParams, "limit", 12), 50),
    });
    return NextResponse.json({ data, source: "comix" }, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=600" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comix collections failed" },
      { status: 502 }
    );
  }
}