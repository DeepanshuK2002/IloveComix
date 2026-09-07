import type { Manga, SearchResult } from "./types";
import type { CatalogCandidate } from "./catalog/types";

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

export { toSearchResult, toManga };