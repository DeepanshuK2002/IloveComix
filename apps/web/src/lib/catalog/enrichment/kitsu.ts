import { fetchJson, firstString, cleanText } from "../http";
import type { CatalogCandidate, CatalogIdentity, CatalogProvider } from "../types";

const API = "https://kitsu.io/api/edge";
const BASE = "https://kitsu.io";

interface KitsuManga {
  id: string;
  attributes: {
    canonicalTitle?: string;
    titles?: Record<string, string>;
    slug?: string;
    synopsis?: string;
    description?: string;
    subtitle?: string;
    subtype?: string;
    status?: string;
    originalLanguage?: string;
    ageRating?: string;
    year?: number;
    startDate?: string;
    posterImage?: Record<string, string>;
    chapterCount?: number;
  };
}

function identity(id: string, slug?: string): CatalogIdentity {
  return {
    provider: "kitsu",
    externalId: String(id),
    externalUrl: slug ? `${BASE}/manga/${slug}` : `${BASE}/manga/${id}`,
  };
}

function candidateFromKitsu(item: KitsuManga): CatalogCandidate {
  const a = item.attributes || {};
  const titles = a.titles || {};
  const allTitles = [titles.en, titles.en_jp, titles.en_us, titles.ja_jp, titles.romaji]
    .filter((title): title is string => Boolean(title));
  return {
    identity: identity(item.id, a.slug),
    title: firstString(a.canonicalTitle, a.titles?.en, a.titles?.en_jp, a.titles?.ja_jp) || "Unknown",
    altTitles: [...new Set(allTitles)],
    description: cleanText(firstString(a.synopsis, a.description)),
    status: a.status?.toLowerCase(),
    type: a.subtype?.toLowerCase(),
    originalLanguage: a.originalLanguage,
    year: a.year ?? (a.startDate ? Number(a.startDate.slice(0, 4)) : null),
    contentRating: a.ageRating,
    coverUrl: firstString(a.posterImage?.original, a.posterImage?.large, a.posterImage?.medium),
    tags: [],
    confidence: 0.7,
  };
}

export const kitsuProvider: CatalogProvider = {
  id: "kitsu",
  kind: "enrichment",
  async search(query) {
    const url = new URL(`${API}/manga`);
    url.searchParams.set("filter[text]", query);
    url.searchParams.set("page[limit]", "20");
    const data = await fetchJson<any>(url.toString(), {
      accept: "application/vnd.api+json",
      revalidate: 3600,
    });
    return ((data.data || []) as KitsuManga[]).map(candidateFromKitsu);
  },
  async get(identity) {
    const data = await fetchJson<any>(`${API}/manga/${encodeURIComponent(identity.externalId)}?include=categories`, {
      accept: "application/vnd.api+json",
      revalidate: 86400,
    });
    if (!data.data) return null;
    const candidate = candidateFromKitsu(data.data as KitsuManga);
    const categories: string[] = data.included
      ? data.included.filter((entry: any) => entry.type === "categories").map((entry: any) => entry.attributes?.name)
      : [];
    return { ...candidate, tags: categories.filter(Boolean) };
  },
};