import type { Chapter, Manga, PaginatedResponse, SearchFilters, SearchResult, Tag } from "./types";
import { mangaDexProvider, fetchMangaDexPages, fetchMangaDexChapters } from "./catalog/providers";
import type { CatalogCandidate } from "./catalog/types";
import { getOrEnrichMangaDexTitle } from "./catalog/service";
import { findCatalogTitleByIdentity, upsertCatalogChapters } from "./catalog/repository";

const EMPTY_PAGE = <T,>(limit = 20, offset = 0): PaginatedResponse<T> => ({ data: [], total: 0, limit, offset });

function toSearchResult(candidate: CatalogCandidate): SearchResult {
  return {
    id: candidate.identity.externalId,
    title: candidate.title,
    altTitles: candidate.altTitles || [],
    description: candidate.description || "",
    status: (candidate.status as SearchResult["status"]) || "ongoing",
    year: candidate.year || null,
    contentRating: (candidate.contentRating as SearchResult["contentRating"]) || "safe",
    type: (candidate.type as SearchResult["type"]) || "manga",
    tags: (candidate.tags || []).map((name, index) => ({ id: `${candidate.identity.externalId}-tag-${index}`, name, group: "genre" })),
    coverUrl: candidate.coverUrl || null,
    bannerUrl: candidate.bannerUrl || null,
    rating: 0,
    followingCount: 0,
    links: candidate.links,
  };
}

function toManga(candidate: CatalogCandidate): Manga {
  const result = toSearchResult(candidate);
  return {
    ...result,
    authors: candidate.authors || [],
    artists: candidate.artists || [],
    localizedTitle: Object.fromEntries((candidate.altTitles || []).map((title, index) => [`alt-${index}`, title])),
    localizedDescription: {},
  };
}

export function getCoverUrl(mangaId: string, fileName: string, quality: "original" | "512" | "256" = "original"): string {
  return `https://uploads.mangadex.org/covers/${encodeURIComponent(mangaId)}/${encodeURIComponent(fileName)}${quality === "original" ? "" : `.${quality}.jpg`}`;
}

export function toHighResCoverUrl(coverUrl: string | null | undefined): string | null {
  return coverUrl ? coverUrl.replace(/\.(256|512)\.jpg$/, "") : null;
}

export const getHighQualityCoverUrl = toHighResCoverUrl;

export function extractTitle(title: Record<string, string> = {}): string {
  return title.en || Object.values(title)[0] || "Unknown";
}

export function extractAltTitles(altTitles: Record<string, string>[] = [], primaryTitle?: string): string[] {
  return [...new Set(altTitles.flatMap((title) => Object.values(title)).filter((title) => title !== primaryTitle))];
}

export function getContentRatings(override?: string[]): string[] {
  return override?.length ? override : ["safe", "suggestive"];
}

export async function searchManga(filters: SearchFilters): Promise<PaginatedResponse<SearchResult>> {
  const data = await mangaDexProvider.search(filters.query?.trim() || "");
  return { data: data.slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20)).map(toSearchResult), total: data.length, limit: filters.limit || 20, offset: filters.offset || 0 };
}

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

export async function getPopularManga(limit = 20, ..._args: unknown[]): Promise<PaginatedResponse<SearchResult>> {
  return searchManga({ query: "", limit });
}

export async function getLatestChapters(..._args: unknown[]): Promise<{ chapter: Chapter; manga: SearchResult }[]> { return []; }
export async function getRecentlyAdded(..._args: unknown[]): Promise<SearchResult[]> { return []; }
export async function getMostFollowedNewComics(..._args: unknown[]): Promise<SearchResult[]> { return []; }
export async function getCompletedManga(..._args: unknown[]): Promise<SearchResult[]> { return []; }
export async function getNewSeries(..._args: unknown[]): Promise<SearchResult[]> { return []; }
export async function getUpcomingManhwa(..._args: unknown[]): Promise<SearchResult[]> { return []; }
export async function getAllTags(): Promise<Tag[]> { return []; }
