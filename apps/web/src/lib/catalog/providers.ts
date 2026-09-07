import { fetchJson, firstString, stripHtml } from "./http";
import type {
  CatalogCandidate,
  CatalogProvider,
  CatalogIdentity,
  CatalogChapterCandidate,
  CatalogSearchOptions,
} from "./types";
import { mangaUpdatesProvider } from "./enrichment/mangaupdates";
import { myAnimeListProvider } from "./enrichment/myanimelist";
import { kitsuProvider } from "./enrichment/kitsu";
import { shikimoriProvider } from "./enrichment/shikimori";
import { animePlanetProvider } from "./enrichment/animeplanet";
import { anidbProvider } from "./enrichment/anidb";
import { annProvider } from "./enrichment/ann";
import { simklProvider } from "./enrichment/simkl";

const MANGADEX_API = "https://api.mangadex.org";
const MANGABAKA_API = "https://api.mangabaka.org";
const ANILIST_API = "https://graphql.anilist.co";
const MANGABAKA_BATCH_LIMIT = 50;

function candidateFromMangaDex(item: any): CatalogCandidate {
  const attributes = item.attributes || {};
  const title = firstString(attributes.title?.en, ...Object.values(attributes.title || {})) || "Unknown";
  const cover = item.relationships?.find((relationship: any) => relationship.type === "cover_art")?.attributes?.fileName;
  const identity: CatalogIdentity = {
    provider: "mangadex",
    externalId: String(item.id),
    externalUrl: `https://mangadex.org/title/${item.id}`,
  };
  return {
    identity,
    title,
    altTitles: (attributes.altTitles || []).flatMap((value: Record<string, string>) => Object.values(value)),
    description: firstString(attributes.description?.en),
    status: attributes.status,
    type: attributes.originalLanguage === "ko" ? "manhwa" : attributes.originalLanguage === "zh" ? "manhua" : "manga",
    originalLanguage: attributes.originalLanguage,
    year: attributes.year || null,
    contentRating: attributes.contentRating,
    coverUrl: cover ? `https://uploads.mangadex.org/covers/${item.id}/${cover}.512.jpg` : null,
    tags: (attributes.tags || []).map((tag: any) => tag.attributes?.name?.en).filter(Boolean),
    links: attributes.links || {},
    rawData: item,
    confidence: 0.9,
  };
}

export const mangaDexProvider: CatalogProvider = {
  id: "mangadex",
  kind: "primary",
  async search(query) {
    const url = new URL(`${MANGADEX_API}/manga`);
    url.searchParams.set("title", query);
    url.searchParams.set("limit", "20");
    url.searchParams.append("includes[]", "cover_art");
    const response = await fetchJson<any>(url.toString());
    return (response.data || []).map(candidateFromMangaDex);
  },
  async get(identity) {
    const response = await fetchJson<any>(`${MANGADEX_API}/manga/${encodeURIComponent(identity.externalId)}?includes[]=cover_art`);
    return candidateFromMangaDex(response.data);
  },
};

function altTitlesFromMangaBaka(item: any): string[] {
  const out: string[] = [];
  const push = (value: unknown) => {
    if (typeof value === "string" && value.trim() && !out.includes(value.trim())) {
      out.push(value.trim());
    }
  };
  push(item.native_title);
  push(item.romanized_title);
  const secondary = item.secondary_titles || {};
  for (const lang of Object.keys(secondary)) {
    const entries = Array.isArray(secondary[lang]) ? secondary[lang] : [];
    for (const entry of entries) {
      if (entry && typeof entry === "object") push((entry as any).title);
    }
  }
  return out;
}

function stringsToArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function candidateFromMangaBaka(item: any): CatalogCandidate {
  const id = String(item.id || item.series_id || item.slug);
  const title = item.title || item.romanized_title || item.name || "Unknown";
  const cover = item.cover || {};
  const coverUrl =
    cover?.x450?.x1 ||
    cover?.x300?.x1 ||
    cover?.raw?.url ||
    cover?.x150?.x1 ||
    cover?.original?.url ||
    null;
  const genres = stringsToArray(item.genres);
  const tags = stringsToArray(item.tags);
  const linksV2 = item.links_v2 && typeof item.links_v2 === "object" ? item.links_v2 : {};
  const links: Record<string, string> = Object.keys(linksV2).length
    ? (Object.fromEntries(
        Object.entries(linksV2).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string"
        )
      ) as Record<string, string>)
    : {};
  if (!Object.keys(links).length && Array.isArray(item.links) && item.links.length) {
    links.official = String(item.links[0]);
  }
  return {
    identity: {
      provider: "mangabaka",
      externalId: id,
      externalUrl: item.canonical_url || `https://mangabaka.org/manga/${id}`,
    },
    title,
    altTitles: altTitlesFromMangaBaka(item),
    description: item.description || null,
    status: item.status,
    type: item.type,
    originalLanguage: item.original_language || undefined,
    year: item.year || null,
    contentRating: item.content_rating || undefined,
    coverUrl,
    authors: stringsToArray(item.authors),
    artists: stringsToArray(item.artists),
    tags: genres.length ? genres : tags.slice(0, 12),
    links,
    rawData: item,
    confidence: 1,
  };
}

export interface MangaBakaGenre {
  label: string;
  value: string;
}

export interface MangaBakaNewsItem {
  id: number | string;
  source_id?: string | null;
  source_name?: string | null;
  title?: string | null;
  url?: string | null;
  primary?: boolean;
  type?: string | null;
  published_at?: string | null;
}

function mangabakaSearchUrl(query: string, options?: CatalogSearchOptions): URL {
  const url = new URL(`${MANGABAKA_API}/v1/series/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "20");
  if (options?.genre) url.searchParams.set("genre", options.genre);
  if (options?.status) url.searchParams.set("status", options.status);
  if (options?.licensed !== undefined) url.searchParams.set("licensed", String(options.licensed));
  return url;
}

function replicateRelations(buckets: Record<string, CatalogCandidate[]>): CatalogCandidate["relations"] {
  const seen = new Set<string>();
  const edges: CatalogCandidate["relations"] = [];
  for (const [relation, items] of Object.entries(buckets)) {
    for (const item of items) {
      const key = `${relation}:${item.identity.externalId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ relation, provider: "mangabaka", externalId: item.identity.externalId, externalUrl: item.identity.externalUrl });
    }
  }
  return edges;
}

export const mangaBakaProvider: CatalogProvider = {
  id: "mangabaka",
  kind: "primary",
  async search(query, options) {
    const response = await fetchJson<any>(mangabakaSearchUrl(query, options).toString());
    const data = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
    return data.map(candidateFromMangaBaka);
  },
  async get(identity) {
    const response = await fetchJson<any>(`${MANGABAKA_API}/v1/series/${encodeURIComponent(identity.externalId)}`);
    const candidate = candidateFromMangaBaka(response.data || response);
    const related = await fetchMangaBakaRelated(identity.externalId).catch(() => ({}));
    return { ...candidate, relations: replicateRelations(related) };
  },
};

let modulesGenresPromise: Promise<MangaBakaGenre[]> | null = null;

/** Supported genre labels from MangaBaka (`/v1/genres`), memoized per process. */
export function fetchMangaBakaGenres(): Promise<MangaBakaGenre[]> {
  if (!modulesGenresPromise) {
    modulesGenresPromise = fetchJson<any>(`${MANGABAKA_API}/v1/genres`)
      .then((response) =>
        Array.isArray(response.data)
          ? response.data.filter(
              (genre: any): genre is MangaBakaGenre =>
                Boolean(genre) &&
                typeof genre.label === "string" &&
                typeof genre.value === "string"
            )
          : []
      )
      .catch(() => [] as MangaBakaGenre[]);
  }
  return modulesGenresPromise;
}

/**
 * Batch fetch up to 50 series in one request. The live API accepts the ids as
 * repeated `id` query params (the docs' comma-separated `ids=` returns 400).
 */
export async function fetchMangaBakaBatch(ids: string[]): Promise<CatalogCandidate[]> {
  const unique = [...new Set(ids.filter(Boolean))].slice(0, MANGABAKA_BATCH_LIMIT);
  if (!unique.length) return [];
  const url = new URL(`${MANGABAKA_API}/v1/series/batch`);
  unique.forEach((id) => url.searchParams.append("id", id));
  const response = await fetchJson<any>(url.toString());
  const data = Array.isArray(response.data) ? response.data : [];
  return data.map(candidateFromMangaBaka);
}

/** Related series keyed by relationship bucket (e.g. `other`, `alternative`). */
export async function fetchMangaBakaRelated(id: string): Promise<Record<string, CatalogCandidate[]>> {
  const response = await fetchJson<any>(`${MANGABAKA_API}/v1/series/${encodeURIComponent(id)}/related`);
  const data = response.data && typeof response.data === "object" ? response.data : {};
  const buckets: Record<string, CatalogCandidate[]> = {};
  for (const [key, items] of Object.entries(data)) {
    buckets[key] = (Array.isArray(items) ? items : []).map(candidateFromMangaBaka);
  }
  return buckets;
}

/** Latest cross-series news items. */
export async function fetchMangaBakaNews(limit = 20, page = 1): Promise<MangaBakaNewsItem[]> {
  const url = new URL(`${MANGABAKA_API}/v1/news`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));
  const response = await fetchJson<any>(url.toString());
  return Array.isArray(response.data) ? response.data : [];
}

const ANILIST_QUERY = `query ($search: String) {
  Page(perPage: 10) {
    media(search: $search, type: MANGA) {
      id idMal title { romaji english native } description status startDate { year }
      type countryOfOrigin genres coverImage { large extraLarge } bannerImage synonyms averageScore
      relations { edges { relationType node { id type title { romaji english } } } }
    }
  }
}`;

function candidateFromAniList(item: any): CatalogCandidate {
  return {
    identity: { provider: "anilist", externalId: String(item.id), externalUrl: `https://anilist.co/manga/${item.id}` },
    title: firstString(item.title?.english, item.title?.romaji, item.title?.native) || "Unknown",
    altTitles: [item.title?.romaji, item.title?.native, ...(item.synonyms || [])].filter(Boolean),
    description: stripHtml(item.description),
    status: item.status?.toLowerCase(),
    type: item.type?.toLowerCase(),
    originalLanguage: item.countryOfOrigin?.toLowerCase(),
    year: item.startDate?.year || null,
    coverUrl: item.coverImage?.extraLarge || item.coverImage?.large || null,
    bannerUrl: item.bannerImage || null,
    tags: item.genres || [],
    relations: (item.relations?.edges || []).map((edge: any) => ({
      relation: edge.relationType,
      provider: "anilist" as const,
      externalId: String(edge.node.id),
    })),
    rawData: item,
    confidence: 0.8,
  };
}

export const aniListProvider: CatalogProvider = {
  id: "anilist",
  kind: "enrichment",
  async search(query) {
    const response = await fetchJson<any>(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: ANILIST_QUERY, variables: { search: query } }),
      revalidate: 3600,
    });
    return (response.data?.Page?.media || []).map(candidateFromAniList);
  },
};

export const metadataProviders: CatalogProvider[] = [
  aniListProvider,
  mangaUpdatesProvider,
  myAnimeListProvider,
  kitsuProvider,
  shikimoriProvider,
  animePlanetProvider,
  anidbProvider,
  annProvider,
  simklProvider,
];

export const primaryProviders: CatalogProvider[] = [mangaBakaProvider, mangaDexProvider];

export async function fetchMangaDexChapters(mangaId: string): Promise<CatalogChapterCandidate[]> {
  const url = new URL(`${MANGADEX_API}/manga/${encodeURIComponent(mangaId)}/feed`);
  url.searchParams.set("limit", "500");
  url.searchParams.set("order[publishAt]", "desc");
  url.searchParams.append("translatedLanguage[]", "en");
  url.searchParams.append("translatedLanguage[]", "ko");
  url.searchParams.append("translatedLanguage[]", "ja");
  url.searchParams.append("translatedLanguage[]", "zh-hk");
  url.searchParams.append("translatedLanguage[]", "zh");
  const response = await fetchJson<any>(url.toString());
  return (response.data || []).map((item: any) => ({
    identity: { provider: "mangadex" as const, externalId: item.id, externalUrl: `https://mangadex.org/chapter/${item.id}` },
    chapterNumber: item.attributes?.chapter || null,
    volumeNumber: item.attributes?.volume || null,
    title: item.attributes?.title || null,
    language: item.attributes?.translatedLanguage || "en",
    publishedAt: item.attributes?.publishAt || null,
    pages: item.attributes?.pages || 0,
    sourceUrl: `https://mangadex.org/chapter/${item.id}`,
    rawData: item,
  }));
}

export async function fetchMangaDexPages(chapterId: string): Promise<string[]> {
  const response = await fetchJson<any>(`${MANGADEX_API}/at-home/server/${encodeURIComponent(chapterId)}`);
  const base = response.baseUrl;
  const hash = response.chapter?.hash;
  return (response.chapter?.data || []).map((page: string) => `${base}/data/${hash}/${page}`);
}