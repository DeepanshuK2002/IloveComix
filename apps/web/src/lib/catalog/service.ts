import {
  primaryProviders,
  metadataProviders,
  aniListProvider,
  mangaBakaProvider,
  mangaDexProvider,
} from "./providers";
import { bestEnrichmentMatch, dedupeCandidates } from "./matching";
import { malIdentity } from "./enrichment/myanimelist";
import { findCatalogTitleByIdentity, upsertCatalogTitle } from "./repository";
import { normalizeCatalogTitle } from "./http";
import type { CatalogCandidate, CatalogSearchOptions } from "./types";

/**
 * Deduplicates on exact normalized title, preferring the highest-confidence
 * candidate (MangaBaka first, then MangaDex, enrichments last).
 */
function dedupeByTitle(candidates: CatalogCandidate[]): CatalogCandidate[] {
  const seen = new Map<string, CatalogCandidate>();
  for (const candidate of candidates) {
    const key = normalizeCatalogTitle(candidate.title);
    const existing = seen.get(key);
    if (!existing || (candidate.confidence || 0) > (existing.confidence || 0)) {
      seen.set(key, candidate);
    }
  }
  return [...seen.values()];
}

export async function searchPrimary(
  query: string,
  options?: CatalogSearchOptions
): Promise<CatalogCandidate[]> {
  const results = await Promise.allSettled(
    primaryProviders.map((provider) => provider.search(query, options))
  );
  return dedupeByTitle(
    results.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
  );
}

/** Full provider search (primary + enrichment), used by the catalog dev endpoint. */
export async function searchCatalog(
  query: string,
  options?: CatalogSearchOptions
): Promise<CatalogCandidate[]> {
  const results = await Promise.allSettled(
    [...primaryProviders, ...metadataProviders].map((provider) =>
      provider.search(query, options)
    )
  );
  return dedupeByTitle(
    results.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
  );
}

/**
 * Runs every enrichment provider against a canonical series and returns only
 * the results that actually match it (title similarity gating) plus MAL
 * cross-reference ids surfaced by AniList (idMal).
 */
async function enrichCanonical(canonical: CatalogCandidate): Promise<CatalogCandidate[]> {
  const runs = await Promise.allSettled(
    metadataProviders.map((provider) =>
      provider.search(canonical.title).catch(() => [] as CatalogCandidate[])
    )
  );

  const matches: CatalogCandidate[] = [];
  metadataProviders.forEach((provider, index) => {
    const run = runs[index];
    if (run.status !== "fulfilled") return;
    const threshold = provider.id === "animeplanet" || provider.id === "anidb" ? 0.5 : 0.55;
    const best = bestEnrichmentMatch(canonical, run.value, threshold);
    if (best) matches.push(best);
  });

  // MAD: derive a MAL identity from AniList's idMal so the cross-reference chain
  // (MangaDex -> AniList -> MAL -> ...) is stored in the catalog.
  const anilist = matches.find((match) => match.identity.provider === "anilist");
  const idMal: number | undefined = (anilist?.rawData as any)?.idMal;
  if (anilist && typeof idMal === "number") {
    matches.push({
      identity: malIdentity(idMal),
      title: anilist.title,
      altTitles: anilist.altTitles,
      confidence: 0.95,
    });
  }

  return dedupeCandidates(matches);
}

/**
 * Resolves a free-text query to one canonical series, pulls metadata from every
 * provider, merges/dedupes it, then stores the whole normalized catalog entry
 * (title + all provider identities) into our own database.
 */
export async function resolveAndEnrichCatalogTitle(query: string): Promise<{ id: string; candidates: CatalogCandidate[] }> {
  const primaryCandidates = await searchPrimary(query);
  if (!primaryCandidates.length) throw new Error("No catalog match found");

  // MangaBaka is the primary normalized source, then MangaDex.
  let canonical =
    primaryCandidates.find((candidate) => candidate.identity.provider === "mangabaka") ||
    primaryCandidates[0];

  // Refresh the canonical snapshot and attach MangaBaka related-series edges
  // (bucket -> externalId). Fall back to the search hit if the detail fetch fails.
  if (canonical.identity.provider === "mangabaka") {
    const refreshed = await mangaBakaProvider
      .get?.(canonical.identity)
      .catch(() => null);
    if (refreshed) canonical = refreshed;
  }

  const enriched = await enrichCanonical(canonical);
  // Only merge OTHER search hits that are literally the same series (identical
  // normalized title). Unrelated results that merely matched the query must not
  // bleed their authors/tags/identities into the canonical record.
  const canonicalNorm = normalizeCatalogTitle(canonical.title);
  const otherPrimary = primaryCandidates.filter(
    (candidate) =>
      candidate.identity.externalId !== canonical.identity.externalId &&
      normalizeCatalogTitle(candidate.title) === canonicalNorm
  );
  const candidates = dedupeCandidates([canonical, ...otherPrimary, ...enriched]);

  const stored = await upsertCatalogTitle(candidates);
  return { id: stored.id, candidates };
}

/** Metadata enrichment for a title already resolved to a MangaDex identity. */
export async function enrichMangaDexTitle(externalId: string): Promise<CatalogCandidate[]> {
  const mangaDex = await mangaDexProvider.get?.({ provider: "mangadex", externalId });
  if (!mangaDex) return [];
  const enriched = await enrichCanonical(mangaDex);
  await upsertCatalogTitle([mangaDex, ...enriched]).catch(() => undefined);
  return [mangaDex, ...enriched];
}

export async function getOrEnrichMangaDexTitle(externalId: string): Promise<CatalogCandidate | null> {
  const stored = await findCatalogTitleByIdentity("mangadex", externalId).catch(() => null);
  if (stored?.title) {
    return {
      identity: { provider: "mangadex", externalId },
      title: stored.title.canonicalTitle,
      altTitles: Array.isArray(stored.title.altTitles) ? (stored.title.altTitles as string[]) : [],
      description: stored.title.description,
      status: stored.title.status,
      type: stored.title.type,
      originalLanguage: stored.title.originalLanguage,
      year: stored.title.year,
      contentRating: stored.title.contentRating,
      coverUrl: stored.title.coverUrl,
      bannerUrl: stored.title.bannerUrl,
      authors: Array.isArray(stored.title.authors) ? stored.title.authors as string[] : [],
      artists: Array.isArray(stored.title.artists) ? stored.title.artists as string[] : [],
      tags: Array.isArray(stored.title.tags) ? stored.title.tags as string[] : [],
      links: stored.title.links as Record<string, string>,
      rawData: stored.title.metadata,
      confidence: 1,
    };
  }

  const mangaDex = await mangaDexProvider.get?.({ provider: "mangadex", externalId });
  if (!mangaDex) return null;
  const enriched = await enrichCanonical(mangaDex);
  await upsertCatalogTitle([mangaDex, ...enriched]).catch(() => undefined);
  return mangaDex;
}

export { mangaBakaProvider, mangaDexProvider, aniListProvider };