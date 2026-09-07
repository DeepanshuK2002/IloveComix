import { NextRequest, NextResponse } from "next/server";
import { searchManga } from "@/lib/mangadex";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const typeParam = searchParams.get("type");

  const type =
    typeParam === "manga"
      ? ["ja"]
      : typeParam === "manhwa"
      ? ["ko"]
      : typeParam === "manhua"
      ? ["zh"]
      : undefined;

  try {
    const results = await searchManga({
      query: q.trim() || undefined,
      type: type as any,
      order: q.trim() ? undefined : "followedCount",
      limit: 15,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { data: [], total: 0, limit: 10, offset: 0 },
      { status: 500 }
    );
  }
}
