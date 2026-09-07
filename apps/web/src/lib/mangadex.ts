import type { Chapter, PaginatedResponse, SearchFilters, SearchResult, Tag } from "./types";
import { mangaDexProvider } from "./catalog/providers";
import { toSearchResult } from "./mangadex-mappers";

export * from "./mangadex-mappers";

export async function searchManga(filters: SearchFilters): Promise<PaginatedResponse<SearchResult>> {
  const data = await mangaDexProvider.search(filters.query?.trim() || "");
  return { data: data.slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20)).map(toSearchResult), total: data.length, limit: filters.limit || 20, offset: filters.offset || 0 };
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