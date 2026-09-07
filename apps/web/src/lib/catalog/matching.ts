import { normalizeCatalogTitle, titleSimilarity } from "./http";
import type { CatalogCandidate } from "./types";

/**
 * Picks the enrichment candidate (from one provider's search results) that
 * most plausibly refers to the canonical series. Returns null when nothing
 * clears the similarity threshold, so unrelated lookalike titles are never
 * merged into the catalog.
 */
export function bestEnrichmentMatch(
  canonical: CatalogCandidate,
  candidates: CatalogCandidate[],
  threshold = 0.55
): CatalogCandidate | null {
  const canonicalTitles = [canonical.title, ...(canonical.altTitles || [])]
    .map((title) => normalizeCatalogTitle(title))
    .filter(Boolean);
  let best: { candidate: CatalogCandidate; score: number } | null = null;
  for (const candidate of candidates) {
    const candidateTitles = [candidate.title, ...(candidate.altTitles || [])]
      .map((title) => normalizeCatalogTitle(title))
      .filter(Boolean);
    let score = 0;
    for (const a of canonicalTitles) {
      for (const b of candidateTitles) {
        if (a === b) {
          score = 1;
          break;
        }
        score = Math.max(score, titleSimilarity(a, b));
      }
      if (score === 1) break;
    }
    if (score >= threshold && (!best || score > best.score)) {
      best = { candidate, score };
    }
  }
  return best ? { ...best.candidate, confidence: best.candidate.confidence ?? best.score } : null;
}

/** Deduplicates candidates on provider+externalId and exact normalized title. */
export function dedupeCandidates(candidates: CatalogCandidate[]): CatalogCandidate[] {
  const byIdentity = new Map<string, CatalogCandidate>();
  const result: CatalogCandidate[] = [];
  for (const candidate of candidates) {
    const identityKey = `${candidate.identity.provider}:${candidate.identity.externalId}`;
    const existing = byIdentity.get(identityKey);
    if (existing) {
      if ((candidate.confidence || 0) > (existing.confidence || 0)) {
        byIdentity.set(identityKey, candidate);
      }
      continue;
    }
    byIdentity.set(identityKey, candidate);
    result.push(candidate);
  }
  return result;
}