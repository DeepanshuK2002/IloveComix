import { fetchJson, firstString } from "../http";
import type { CatalogCandidate, CatalogIdentity, CatalogProvider } from "../types";

// Simkl requires a free API key (https://simkl.com/settings/developer).
// Without SIMKL_API_KEY set, this provider is inert.
const API = "https://api.simkl.com/search/manga";
const BASE = "https://simkl.com/manga";

interface SimklResult {
  ids?: { simkl?: number };
  title?: Record<string, string>;
  type?: string;
  year?: number;
}

function identity(id: number): CatalogIdentity {
  return { provider: "simkl", externalId: String(id), externalUrl: `${BASE}/${id}` };
}

export const simklProvider: CatalogProvider = {
  id: "simkl",
  kind: "enrichment",
  async search(query) {
    const apiKey = process.env.SIMKL_API_KEY;
    if (!apiKey) return [];
    const url = new URL(API);
    url.searchParams.set("q", query);
    const data = await fetchJson<SimklResult[]>(url.toString(), {
      headers: { "simkl-api-key": apiKey },
      revalidate: 86400,
    });
    return (data || []).map((item) => ({
      identity: identity(item.ids?.simkl || 0),
      title: firstString(item.title?.en, item.title?.zh, item.title?.ja) || "Unknown",
      type: item.type?.toLowerCase(),
      year: item.year || null,
      confidence: 0.8,
    }));
  },
};