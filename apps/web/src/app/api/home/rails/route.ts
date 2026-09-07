import { NextRequest, NextResponse } from "next/server";
import { getMostFollowedNewComics, getPopularManga } from "@/lib/mangadex";
import { getUserContext } from "@/lib/user-context";

const WINDOW_DAYS: Record<string, number> = {
  today: 1,
  "7days": 7,
  "30days": 30,
  "3months": 90,
  "6months": 180,
  year: 365,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section");
  const time = req.nextUrl.searchParams.get("time") || "";

  const days = WINDOW_DAYS[time];
  if (days === undefined) {
    return NextResponse.json({ section, time, data: [] });
  }

  const { language, activeRatings } = await getUserContext();
  const createdAtSince = new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 19);

  try {
    if (section === "popular") {
      const res = await getPopularManga(30, activeRatings, language, createdAtSince);
      return NextResponse.json({ section, time, data: res.data });
    }
    if (section === "newFollows") {
      const data = await getMostFollowedNewComics(15, activeRatings, language, createdAtSince);
      return NextResponse.json({ section, time, data });
    }
  } catch {
    return NextResponse.json({ section, time, data: [] });
  }

  return NextResponse.json({ section, time, data: [] });
}