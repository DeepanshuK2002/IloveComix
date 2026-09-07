import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("Adult source image integration is disabled.", { status: 503 });
}
