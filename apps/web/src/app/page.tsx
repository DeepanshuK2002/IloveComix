import {
  getPopularManga,
  getLatestChapters,
  getRecentlyAdded,
  getMostFollowedNewComics,
  getCompletedManga,
  getNewSeries,
  getUpcomingManhwa,
} from "@/lib/mangadex";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";
import { HomeSidebar } from "@/components/home/HomeSidebar";
import { attachBannersToMangaList } from "@/lib/banners";
import type { Chapter, SearchResult } from "@/lib/types";
import { getUserContext } from "@/lib/user-context";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { language, activeRatings } = await getUserContext();

  // Fetch all sections concurrently with graceful fallbacks
  const [popularResult, latestResult, recentResult, newFollowsResult, completedResult, newSeriesResult, upcomingResult] =
    await Promise.allSettled([
      getPopularManga(30, activeRatings, language),
      getLatestChapters(20, activeRatings, language),
      getRecentlyAdded(12, activeRatings, language),
      getMostFollowedNewComics(15, activeRatings, language),
      getCompletedManga(12, activeRatings, language),
      getNewSeries(12, activeRatings, language),
      getUpcomingManhwa(12, activeRatings, language),
    ]);

  const popularList: SearchResult[] =
    popularResult.status === "fulfilled" ? popularResult.value.data : [];
  const latestChaptersList: { chapter: Chapter; manga: SearchResult }[] =
    latestResult.status === "fulfilled" ? latestResult.value : [];
  const recentlyAddedList: SearchResult[] =
    recentResult.status === "fulfilled" ? recentResult.value : [];
  const newFollowsList: SearchResult[] =
    newFollowsResult.status === "fulfilled" ? newFollowsResult.value : [];
  const completedList: SearchResult[] =
    completedResult.status === "fulfilled" ? completedResult.value : [];
  const newSeriesList: SearchResult[] =
    newSeriesResult.status === "fulfilled" ? newSeriesResult.value : [];
  const upcomingList: SearchResult[] =
    upcomingResult.status === "fulfilled" ? upcomingResult.value : [];

  // Feature items for the top sliding banner carousel (enriched with horizontal wallpaper banners)
  const carouselItems = await attachBannersToMangaList(popularList.slice(0, 13));

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 overflow-x-hidden">
      {/* Background ambient grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 vercel-grid vercel-grid-mask opacity-60"
        aria-hidden="true"
      />

      {/* Top subtle radial beam */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[420px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,255,255,0.08),transparent_100%)]"
        aria-hidden="true"
      />

      {/* Top Sliding Banner */}
      {carouselItems.length > 0 && (
        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-5 sm:pt-8 pb-4">
          <HeroCarousel items={carouselItems} />
        </section>
      )}

      {/* Main Home Content: 2-Column Grid (Main Feed + Sidebar) */}
      <main className="relative mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
          {/* Left Column: Comic Rails & Latest Updates Grid (Expanded to 9/12) */}
          <div className="lg:col-span-9 min-w-0">
            <HomeFeedClient
              popular={popularList}
              latestChapters={latestChaptersList}
              newFollows={newFollowsList}
              newSeries={newSeriesList}
              upcomingManhwa={upcomingList}
              showAdultTrending={activeRatings.includes("pornographic")}
            />
          </div>

          {/* Right Column: PWA/Discord & Recently Added (Compact 3/12) */}
          <div className="lg:col-span-3 min-w-0">
            <HomeSidebar
              recentlyAdded={recentlyAddedList.length > 0 ? recentlyAddedList : popularList.slice(0, 10)}
              completedSeries={completedList.length > 0 ? completedList : popularList.slice(10, 20)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
