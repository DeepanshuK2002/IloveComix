import { NextRequest, NextResponse } from "next/server";
import { readComixChapter } from "@/lib/comix/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get("chapterId")?.trim();
  if (!chapterId) {
    return NextResponse.json({ error: "Missing required query parameter: chapterId" }, { status: 400 });
  }
  try {
    const data = await readComixChapter(chapterId);
    if (!data || !data.images.length) {
      return NextResponse.json(
        {
          error: "Chapter images unavailable",
          hint: "The unofficial Comix API could not retrieve images for this chapter (upstream unavailable or the chapter ID is invalid).",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ data, source: "comix" }, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comix read failed" },
      { status: 502 }
    );
  }
}