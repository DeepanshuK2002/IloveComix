import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getMangaDetails, getMangaChapters } from "@/lib/mangadex-server";
import { getPopularManga, toHighResCoverUrl } from "@/lib/mangadex";
import { getBannerForManga } from "@/lib/banners";
import { CONTENT_LANGUAGES } from "@/lib/settings";
import { MangaDetails } from "@/components/manga/MangaDetails";
import { ChapterList } from "@/components/manga/ChapterList";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const manga = await getMangaDetails(slug);
    return {
      title: `${manga.title} - Ilovecomix`,
      description: manga.description?.slice(0, 160) || "",
    };
  } catch {
    return { title: "Manga - Ilovecomix" };
  }
}

export default async function MangaPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const language = decodeURIComponent(cookieStore.get("ilovecomix-language")?.value || "en");
  const [manga, chaptersRes, recommendationsRes] = await Promise.all([
    getMangaDetails(slug).catch(() => null),
    // Fetch chapters across ALL languages so the per-comic language dropdown
    // can list every language this comic actually has chapters in.
    getMangaChapters(slug, "all", 500, 0).catch(() => ({
      data: [],
      total: 0,
      limit: 500,
      offset: 0,
    })),
    getPopularManga(15, undefined, language).catch(() => ({
      data: [],
      total: 0,
      limit: 15,
      offset: 0,
    })),
  ]);

  if (!manga) notFound();

  const bannerUrl = await getBannerForManga(manga.id, manga.title, manga.links);
  const displayChapters = chaptersRes.data;

  // Languages actually present in this comic's chapters (incl. external "en" copies)
  const languageSet = new Set<string>();
  for (const chapter of displayChapters) {
    languageSet.add(chapter.translatedLanguage || "en");
  }
  const availableLanguages = Array.from(languageSet).sort((a, b) => {
    const ia = CONTENT_LANGUAGES.findIndex((l) => l.code === a);
    const ib = CONTENT_LANGUAGES.findIndex((l) => l.code === b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const hasRequestedLanguage = languageSet.has(language);
  const initialLanguage = hasRequestedLanguage
    ? language
    : availableLanguages.includes("en")
    ? "en"
    : availableLanguages[0] || "en";

  // True distinct chapter total across every language/source (e.g. 40, not 122 rows)
  const totalChapterCount = new Set(
    displayChapters
      .map((c) => parseFloat(c.chapter || "0"))
      .filter((n) => !isNaN(n))
  ).size;

  const highResCover = toHighResCoverUrl(manga.coverUrl);
  const displayBanner = bannerUrl || highResCover;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 dark:bg-black dark:text-white">
      {/* Top Banner Header */}
      <div
        className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950"
        style={{
          backgroundImage: displayBanner
            ? `url(${displayBanner})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        {/* Gradient overlays to smoothly fade edges into background while keeping artwork clear */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa]/40 to-transparent dark:from-black dark:via-black/70 dark:to-black/30 dark:backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8f9fa]/60 via-transparent to-[#f8f9fa]/60 dark:from-black/80 dark:via-black/40 dark:to-black/80" />
      </div>

      {/* Main Profile & Chapters Container overlapping banner */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 -mt-36 sm:-mt-44 md:-mt-48 z-10 pb-16">
        <MangaDetails manga={manga} chapters={displayChapters} />

        {/* Chapters Section */}
        <div className="mt-14 pt-8 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Chapters
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
                {totalChapterCount}
              </span>
            </h2>
          </div>
          <ChapterList
            mangaId={manga.id}
            mangaTitle={manga.title}
            altTitles={manga.altTitles}
            chapters={displayChapters}
            recommendations={recommendationsRes.data.filter((r) => r.id !== manga.id)}
            availableLanguages={availableLanguages}
            initialLanguage={initialLanguage}
            showingLanguageFallback={!hasRequestedLanguage && language !== "en"}
            adult={manga.contentRating === "erotica" || manga.contentRating === "pornographic"}
          />
        </div>
      </div>
    </div>
  );
}
