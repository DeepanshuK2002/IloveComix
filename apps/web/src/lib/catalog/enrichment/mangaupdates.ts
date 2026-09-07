import { fetchJson, firstString, cleanText } from "../http";
import type { CatalogCandidate, CatalogIdentity, CatalogProvider } from "../types";

const API = "https://api.mangaupdates.com/v1/series/search";
const BASE = "https://www.mangaupdates.com";

interface MuRecord {
  series_id: number;
  id?: number;
  title?: string;
  description?: string;
  status?: string;
  type?: string;
  year?: number;
  licensed?: number;
  genres?: { genre?: string }[] | string[];
  authors?: { name?: string }[] | string[];
  artists?: { name?: string }[] | string[];
  image?: {
    url?: { original?: string; thumb?: string } | string;
    thumb?: string;
  };
  url?: string;
  website?: string;
}

interface MuResult {
  id: number;
  record: MuRecord;
}

function identity(id: number | string): CatalogIdentity {
  return {
    provider: "mangaupdates",
    externalId: String(id),
    externalUrl: `${BASE}/series.html?id=${id}`,
  };
}

function names(values: { name?: string }[] | string[] | undefined): string[] {
  if (!values) return [];
  const all: (string | undefined)[] = values.map((value) =>
    typeof value === "string" ? value : value.name
  );
  return all.filter((value): value is string => Boolean(value));
}

function stringTags(values: { genre?: string }[] | string[] | undefined): string[] {
  if (!values) return [];
  const all: (string | undefined)[] = values.map((value) =>
    typeof value === "string" ? value : value.genre
  );
  return all.filter((value): value is string => Boolean(value));
}

function candidateFromMu(result: MuRecord): CatalogCandidate {
  const id = result.series_id || result.id || 0;
  const imageUrl = result.image?.url;
  const cover = typeof imageUrl === "string" ? imageUrl : imageUrl?.original || imageUrl?.thumb || (typeof result.image?.thumb === "string" ? result.image?.thumb : "");
  return {
    identity: identity(id),
    title: firstString(result.title) || "Unknown",
    description: cleanText(result.description),
    status: result.status,
    type: result.type ? result.type.toLowerCase() : null,
    year: result.year || null,
    coverUrl: cover || null,
    authors: names(result.authors),
    artists: names(result.artists),
    tags: stringTags(result.genres),
    rawData: result,
    confidence: 0.66,
  };
}

export const mangaUpdatesProvider: CatalogProvider = {
  id: "mangaupdates",
  kind: "enrichment",
  async search(query) {
    const data = await fetchJson<{ results?: MuResult[] }>(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: query, perpage: 20 }),
    });
    return (data.results || []).map((result) => candidateFromMu(result.record));
  },
};