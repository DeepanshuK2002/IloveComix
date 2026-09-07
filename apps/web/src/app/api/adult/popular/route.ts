import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ allowed: false, items: [], sourceCount: 0, updatedAt: null });
}
