export const dynamic = "force-dynamic";

import { getMangaDetails, getChapterImages, getMangaChapters } from "@/lib/mangadex";
import { WebtoonReader } from "@/components/reader/WebtoonReader";
import type { Chapter } from "@/lib/types";

interface PageProps {
  params: Promise<{ mangaId: string; chapterId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { mangaId, chapterId } = await params;
  try {
    const manga = await getMangaDetails(mangaId);
    const chapters = await getMangaChapters(mangaId, "en", 500, 0);
    const current = chapters.data.find((c) => c.id === chapterId);
    return {
      title: `${manga.title} - Ch. ${current?.chapter || ""} | Ilovecomix`,
    };
  } catch {
    return { title: "Reader | Ilovecomix" };
  }
}

export default async function ReadPage({ params }: PageProps) {
  const { mangaId, chapterId } = await params;

  const [manga, rawChapterList, rawImages] = await Promise.all([
    getMangaDetails(mangaId).catch(() => null),
    getMangaChapters(mangaId, "en", 500, 0).catch(() => ({
      data: [] as Chapter[],
      total: 0,
      limit: 500,
      offset: 0,
    })),
    getChapterImages(chapterId).catch(() => [] as string[]),
  ]);

  if (!manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Manga not found</h1>
        <a
          href="/browse"
          className="text-accent-primary hover:text-accent-secondary"
        >
          Browse Manga
        </a>
      </div>
    );
  }

  // Enrich chapters so external missing chapters are present in the reader navigation
  const chaptersToUse = rawChapterList.data;

  const currentChapter = chaptersToUse.find((c) => c.id === chapterId) || null;

  // Distinct chapter navigation
  const currentChapterNum = currentChapter?.chapter
    ? parseFloat(currentChapter.chapter)
    : NaN;

  // Sort ascending by chapter number
  const sortedAsc = [...chaptersToUse].sort((a, b) => {
    const numA = parseFloat(a.chapter || "0");
    const numB = parseFloat(b.chapter || "0");
    return numA - numB;
  });

  let nextChapter: Chapter | null = null;
  let prevChapter: Chapter | null = null;

  if (!isNaN(currentChapterNum)) {
    // Next chapter is the lowest chapter number strictly greater than current
    nextChapter =
      sortedAsc.find(
        (c) =>
          parseFloat(c.chapter || "0") > currentChapterNum && c.id !== chapterId
      ) || null;

    // Previous chapter is the highest chapter number strictly less than current
    prevChapter =
      [...sortedAsc]
        .reverse()
        .find(
          (c) =>
            parseFloat(c.chapter || "0") < currentChapterNum && c.id !== chapterId
        ) || null;
  } else {
    // Index fallback if chapter numbers are non-numeric
    const idx = sortedAsc.findIndex((c) => c.id === chapterId);
    if (idx !== -1) {
      if (idx < sortedAsc.length - 1) nextChapter = sortedAsc[idx + 1];
      if (idx > 0) prevChapter = sortedAsc[idx - 1];
    }
  }

  const allChapters = [...chaptersToUse].map((c) => ({
    id: c.id,
    title: `Ch. ${c.chapter || "?"}${c.title ? ` - ${c.title}` : ""}`,
  }));

  // Unique chapter numbers across every source (dedupe provider duplicates) so
  // the "X / Y" counter reflects distinct chapters (e.g. 12 / 40) and navigation
  // stays continuous across providers.
  const uniqueChapterNums = [
    ...new Set(
      chaptersToUse
        .map((c) => parseFloat(c.chapter || "NaN"))
        .filter((n) => !isNaN(n))
    ),
  ].sort((a, b) => a - b);
  const chapterIndex = isNaN(currentChapterNum)
    ? -1
    : uniqueChapterNums.indexOf(currentChapterNum);
  const chapterTotal = uniqueChapterNums.length;

  return (
    <WebtoonReader
      mangaId={manga.id}
      mangaTitle={manga.title}
      chapterId={chapterId}
      chapterTitle={`Ch. ${currentChapter?.chapter || ""}${currentChapter?.title ? ` - ${currentChapter.title}` : ""}`}
      images={rawImages}
      nextChapterId={
        nextChapter
          ? { id: nextChapter.id, title: `Ch. ${nextChapter.chapter || ""}` }
          : null
      }
      prevChapterId={
        prevChapter
          ? { id: prevChapter.id, title: `Ch. ${prevChapter.chapter || ""}` }
          : null
      }
      allChapters={allChapters}
      chapterIndex={chapterIndex}
      chapterTotal={chapterTotal}
    />
  );
}
