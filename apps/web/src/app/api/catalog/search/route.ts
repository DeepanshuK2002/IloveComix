import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });

  const genre = request.nextUrl.searchParams.get("genre")?.trim() || undefined;
  const status = request.nextUrl.searchParams.get("status")?.trim() || undefined;
  const licensedRaw = request.nextUrl.searchParams.get("licensed");
  const licensed = licensedRaw === "true" ? true : licensedRaw === "false" ? false : undefined;

  try {
    return NextResponse.json({ data: await searchCatalog(query, { genre, status, licensed }) });
  } catch {
    return NextResponse.json({ error: "Catalog search failed" }, { status: 502 });
  }
}
