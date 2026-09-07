import { fetchJson, firstString } from "../http";
import type { CatalogCandidate, CatalogIdentity, CatalogProvider } from "../types";

const PREFIX = "https://myanimelist.net/search/prefix.json";
const BASE = "https://myanimelist.net";

interface MalItem {
  id: number;
  name?: string;
  url?: string;
  image_url?: string;
  payload?: {
    mal_id?: number;
    id?: number;
    title?: string;
    name?: string;
    title_english?: string;
    picture_url?: string;
    type?: string;
    url?: string;
  };
}

export function malIdentity(malId: number | string): CatalogIdentity {
  return {
    provider: "myanimelist",
    externalId: String(malId),
    externalUrl: `${BASE}/manga/${malId}`,
  };
}

function identityFromItem(item: MalItem): CatalogIdentity {
  const id = item.payload?.mal_id ?? item.payload?.id ?? item.id;
  return malIdentity(id);
}

export function candidateFromMal(item: MalItem): CatalogCandidate {
  const payload = item.payload || {};
  return {
    identity: identityFromItem(item),
    title: firstString(payload.title, payload.title_english, item.name) || "Unknown",
    altTitles: [payload.title_english, item.name].filter((title): title is string => Boolean(title)),
    coverUrl: firstString(payload.picture_url, item.image_url),
    type: payload.type?.toLowerCase(),
    confidence: 0.85,
  };
}

export const myAnimeListProvider: CatalogProvider = {
  id: "myanimelist",
  kind: "enrichment",
  async search(query) {
    // MAL's prefix.json autocomplete endpoint is the only keyless way to
    // resolve a title to a MAL id. It is Cloudflare-guarded from some IPs;
    // failure is treated as "no results".
    const url = new URL(PREFIX);
    url.searchParams.set("type", "manga");
    url.searchParams.set("keyword", query);
    const data = await fetchJson<{ categories?: { type?: string; items?: MalItem[] }[] }>(
      url.toString(),
      { userAgent: "browser", revalidate: 3600 }
    );
    const manga = (data.categories || []).find((category) => category.type === "manga");
    return (manga?.items || []).map(candidateFromMal);
  },
};