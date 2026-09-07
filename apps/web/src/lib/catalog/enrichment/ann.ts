import { fetchHtml, firstString, cleanText, decodeEntities } from "../http";
import type { CatalogCandidate, CatalogIdentity, CatalogProvider } from "../types";

const API = "https://cdn.animenewsnetwork.com/encyclopedia/api.xml";
const BASE = "https://www.animenewsnetwork.com/encyclopedia";

interface AnnEntry {
  id: string;
  info: Record<string, string[]>;
}

function parseAnnEntries(xml: string): AnnEntry[] {
  const entries: AnnEntry[] = [];
  // The XML API wraps entries in <ann><manga-list><manga id="..">…; match the
  // <manga> element directly so we survive either wrapper.
  const mangaRe = /<manga\s+(?:[^>]*?)?id="([^"]+)"[^>]*>([\s\S]*?)<\/manga>/g;
  const infoRe = /<info\s+type="([^"]+)"(?:\s+gid="\d+")?\s+value="([^"]*)"\s*\/?>/g;
  let m: RegExpExecArray | null;
  while ((m = mangaRe.exec(xml)) !== null) {
    const info: Record<string, string[]> = {};
    let im: RegExpExecArray | null;
    while ((im = infoRe.exec(m[2])) !== null) {
      (info[im[1]] ||= []).push(decodeEntities(im[2]));
    }
    if (!info["Main title"]) continue;
    entries.push({ id: m[1], info });
  }
  return entries;
}

function identity(id: string): CatalogIdentity {
  return { provider: "ann", externalId: id, externalUrl: `${BASE}/manga.php?id=${id}` };
}

function candidateFromEntry(entry: AnnEntry): CatalogCandidate {
  const title = firstString(entry.info["Main title"]?.[0]) || "Unknown";
  return {
    identity: identity(entry.id),
    title,
    altTitles: [...new Set(entry.info["Alternative title"] || [])],
    description: cleanText(firstString(entry.info["Plot Summary"]?.[0])),
    coverUrl: entry.info["Picture"]?.[0] || null,
    year: entry.info["Vintage"]?.[0] ? Number(entry.info["Vintage"][0].slice(0, 4)) || null : null,
    tags: entry.info["Genres"] || [],
    rawData: { info: entry.info },
    confidence: 0.68,
  };
}

export const annProvider: CatalogProvider = {
  id: "ann",
  kind: "enrichment",
  async search(query) {
    const url = new URL(API);
    url.searchParams.set("title", query);
    url.searchParams.set("manga", "yes");
    const xml = await fetchHtml(url.toString(), { revalidate: 86400 });
    return parseAnnEntries(xml).map(candidateFromEntry);
  },
};