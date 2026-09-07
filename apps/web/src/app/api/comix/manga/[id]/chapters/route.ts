import { NextRequest, NextResponse } from "next/server";
import { getComixChapters } from "@/lib/comix/api";
import { intParam } from "@/lib/comix/route-util";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = _request.nextUrl.searchParams;
  const groupId = searchParams.get("scanlation_group_id");
  try {
    const data = await getComixChapters(id, {
      page: intParam(searchParams, "page", 1),
      limit: Math.min(intParam(searchParams, "limit", 30), 100),
      groupId: groupId ? Number.parseInt(groupId, 10) : undefined,
    });
    return NextResponse.json({ data, source: "comix" }, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comix chapters failed" },
      { status: 502 }
    );
  }
}