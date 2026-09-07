import { NextRequest, NextResponse } from "next/server";
import { resolveAndEnrichCatalogTitle } from "@/lib/catalog/service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  try {
    const result = await resolveAndEnrichCatalogTitle(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Catalog enrichment failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Catalog enrichment failed" },
      { status: 502 }
    );
  }
}
