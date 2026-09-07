import { fetchHtml, firstString, cleanText } from "../http";
import type { CatalogCandidate, CatalogIdentity, CatalogProvider } from "../types";

const BASE = "https://www.anime-planet.com";

function identity(slug: string): CatalogIdentity {
  return { provider: "animeplanet", externalId: slug, externalUrl: `${BASE}/manga/${slug}` };
}

export const animePlanetProvider: CatalogProvider = {
  id: "animeplanet",
  kind: "enrichment",
  async search(query) {
    const url = new URL(`${BASE}/manga/all`);
    url.searchParams.set("name", query);
    const html = await fetchHtml(url.toString(), { userAgent: "browser", revalidate: 86400 });
    const out: CatalogCandidate[] = [];
    const seen = new Set<string>();
    const cardRe = /<a\s+[^>]*class="[^"]*\bcard\b[^"]*"[^>]*href="(\/manga\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    const itemRe = /<h3[^>]*class="[^"]*\bcardName\b[^"]*"[^>]*>([^<]+)<\/h3>|<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = cardRe.exec(html)) !== null) {
      const href = m[1];
      const title = cleanText(m[2].match(/<h3[^>]*>([^<]+)<\/h3>/)?.[1]) ||
        cleanText(m[2].match(/<img[^>]+alt="([^"]+)"/)?.[1]);
      const src = m[2].match(/<img[^>]+src="([^"]+)"/)?.[1];
      if (!title || href.includes("/categories/")) continue;
      const key = href;
      if (seen.has(key) || out.length >= 20) continue;
      seen.add(key);
      out.push({
        identity: identity(href.replace(/^\//, "") || href),
        title: title || (href.split("/").pop() || "").replace(/-/g, " ") || "Unknown",
        coverUrl: src || null,
        confidence: 0.62,
      });
    }
    // Fallback simple anchors if the card classes changed
    if (!out.length) {
      const anchorRe = /href="(\/manga\/[a-z0-9-]+)"/g;
      const seenInner = new Set<string>();
      while ((m = anchorRe.exec(html)) !== null) {
        const href = m[1];
        if (seenInner.has(href) || out.length >= 20) continue;
        seenInner.add(href);
        out.push({
          identity: identity(href.replace(/^\//, "")),
          title: (href.split("/").pop() || "").replace(/-/g, " "),
          confidence: 0.4,
        });
      }
    }
    return out;
  },
};