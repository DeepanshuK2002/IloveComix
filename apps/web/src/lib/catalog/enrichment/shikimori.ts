import { fetchJson, firstString } from "../http";
import type { CatalogCandidate, CatalogIdentity, CatalogProvider } from "../types";

const API = "https://shikimori.one/api";
const BASE = "https://shikimori.one";
// Shikimori blocks well-known scraper/default user agents.
const UA = "Ilovecomix/1.0 (metadata enrichment; contact: local dev)";

interface ShikiManga {
  id: number;
  name?: string;
  russian?: string;
  kind?: string;
  score?: number;
  status?: string;
  releasedOn?: string;
  synonyms?: string[];
  genres?: { id: number; name: string; russian: string }[];
  image?: { original?: string; preview?: string };
}

function identity(id: number | string): CatalogIdentity {
  return {
    provider: "shikimori",
    externalId: String(id),
    externalUrl: `${BASE}/mangas/${id}`,
  };
}

function candidateFromShikimori(item: ShikiManga): CatalogCandidate {
  const altTitles = [item.russian, ...(item.synonyms || [])].filter(
    (title): title is string => Boolean(title)
  );
  return {
    identity: identity(item.id),
    title: item.name || "Unknown",
    altTitles,
    status: item.status,
    type: item.kind,
    year: item.releasedOn ? Number(item.releasedOn.slice(0, 4)) || null : null,
    coverUrl: firstString(item.image?.original, item.image?.preview),
    tags: (item.genres || []).map((genre) => genre.name).filter(Boolean),
    confidence: 0.72,
  };
}

export const shikimoriProvider: CatalogProvider = {
  id: "shikimori",
  kind: "enrichment",
  async search(query) {
    const url = new URL(`${API}/mangas`);
    url.searchParams.set("search", query);
    url.searchParams.set("limit", "20");
    const data = await fetchJson<ShikiManga[]>(url.toString(), { userAgent: UA, revalidate: 3600 });
    return (data || []).map(candidateFromShikimori);
  },
  async get(identity) {
    const item = await fetchJson<ShikiManga>(
      `${API}/mangas/${encodeURIComponent(identity.externalId)}?extended=1`,
      { userAgent: UA, revalidate: 86400 }
    );
    return candidateFromShikimori(item);
  },
};