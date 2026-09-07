import type { Chapter, Manga, PaginatedResponse } from "./types";
import { fetchMangaDexPages, fetchMangaDexChapters } from "./catalog/providers";
import { getOrEnrichMangaDexTitle } from "./catalog/service";
import { findCatalogTitleByIdentity, upsertCatalogChapters } from "./catalog/repository";
import { toManga } from "./mangadex-mappers";

export async function getMangaDetails(id: string): Promise<Manga> {
  const candidate = await getOrEnrichMangaDexTitle(id);
  if (!candidate) throw new Error("Manga not found");
  return toManga(candidate);
}

export async function getMangaChapters(id: string, ..._args: unknown[]): Promise<PaginatedResponse<Chapter>> {
  const chapters = await fetchMangaDexChapters(id);
  const stored = await findCatalogTitleByIdentity("mangadex", id).catch(() => null);
  if (stored?.titleId) {
    await upsertCatalogChapters(stored.titleId, chapters).catch(() => undefined);
  }
  return {
    data: chapters.map((chapter) => ({
      id: chapter.identity.externalId,
      title: chapter.title || null,
      volume: chapter.volumeNumber || null,
      chapter: chapter.chapterNumber || null,
      pages: chapter.pages || 0,
      publishAt: chapter.publishedAt || new Date().toISOString(),
      scanlationGroup: "MangaDex",
      translatedLanguage: chapter.language || "en",
      source: "mangadex",
      sourceName: "MangaDex",
      externalUrl: chapter.sourceUrl,
      readUrl: `/read/${encodeURIComponent(id)}/${chapter.identity.externalId}`,
    })),
    total: chapters.length,
    limit: 500,
    offset: 0,
  };
}

export async function getChapterImages(chapterId: string): Promise<string[]> {
  return fetchMangaDexPages(chapterId);
}