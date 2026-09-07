import { fetchHtml, cleanText, firstString } from "../http";
import type { CatalogCandidate, CatalogIdentity, CatalogProvider } from "../types";

const BASE = "https://anidb.net";

function identity(id: string): CatalogIdentity {
  return { provider: "anidb", externalId: id, externalUrl: `${BASE}/m/${id}` };
}

export const anidbProvider: CatalogProvider = {
  id: "anidb",
  kind: "enrichment",
  async search(query) {
    const url = new URL(`${BASE}/search/manga/`);
    url.searchParams.set("adb_search", query);
    const html = await fetchHtml(url.toString(), { userAgent: "browser", revalidate: 86400 });
    const out: CatalogCandidate[] = [];
    const seen = new Set<string>();
    // AniDB manga entries link to /m/{id} (title on the anchor or its sibling)
    const re = /<a[^>]+href="(\/m\/(\d+))"[^>]*>([^<]*)<\/a>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const href = m[1];
      const id = m[2];
      const anchorText = cleanText(m[3]) || "";
      if (seen.has(id) || out.length >= 15) continue;
      if (!anchorText || anchorText.length < 2 || /^\s*$/.test(anchorText)) continue;
      seen.add(id);
      out.push({
        identity: identity(id),
        title: firstString(anchorText) || "Unknown",
        confidence: 0.55,
      });
    }
    // Backstop: grab titles from the result-card markup when the anchor above misses
    if (!out.length) {
      const cardRe = /href="(\/m\/(\d+))"[^>]*>\s*<[^>]*>[\s\S]*?<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</g;
      while ((m = cardRe.exec(html)) !== null) {
        const id = m[2];
        const title = cleanText(m[3] || "");
        if (!title || seen.has(id)) continue;
        seen.add(id);
        out.push({ identity: identity(id), title, confidence: 0.5 });
        if (out.length >= 15) break;
      }
    }
    return out;
  },
};