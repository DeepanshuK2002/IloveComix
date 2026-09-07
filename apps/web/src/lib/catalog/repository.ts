import { prisma } from "../prisma";
import { normalizeCatalogTitle } from "./http";
import type {
  CatalogCandidate,
  CatalogChapterCandidate,
  NormalizedCatalogTitle,
} from "./types";

export async function findCatalogTitleByIdentity(provider: string, externalId: string) {
  return prisma.catalogIdentity.findUnique({
    where: { provider_externalId: { provider, externalId } },
    include: { title: true },
  });
}

function mergeStrings(...groups: (string[] | undefined)[]): string[] {
  return [...new Set(groups.flatMap((group) => group || []).map((value) => value.trim()).filter(Boolean))];
}

export function normalizeCandidate(candidate: CatalogCandidate): NormalizedCatalogTitle {
  return {
    canonicalTitle: candidate.title,
    altTitles: candidate.altTitles || [],
    normalizedTitle: normalizeCatalogTitle(candidate.title),
    description: candidate.description || null,
    status: candidate.status || null,
    type: candidate.type || null,
    originalLanguage: candidate.originalLanguage || null,
    year: candidate.year || null,
    contentRating: candidate.contentRating || null,
    coverUrl: candidate.coverUrl || null,
    bannerUrl: candidate.bannerUrl || null,
    authors: candidate.authors || [],
    artists: candidate.artists || [],
    tags: candidate.tags || [],
    relations: candidate.relations || [],
    links: candidate.links || {},
    metadata: { provider: candidate.identity.provider, raw: candidate.rawData || null },
  };
}

function dedupeRelations(relations: NonNullable<CatalogCandidate["relations"]>): NonNullable<CatalogCandidate["relations"]> {
  const seen = new Set<string>();
  return relations.filter((relation) => {
    const key = `${relation.provider}:${relation.externalId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function upsertCatalogTitle(
  candidates: CatalogCandidate[]
): Promise<{ id: string; normalizedTitle: string }> {
  if (!candidates.length) throw new Error("At least one catalog candidate is required");

  const ordered = [...candidates].sort(
    (a, b) => (b.confidence || 0) - (a.confidence || 0)
  );
  const primary = normalizeCandidate(ordered[0]);
  const merged = ordered.slice(1).reduce((result, candidate) => {
    const normalized = normalizeCandidate(candidate);
    return {
      ...result,
      altTitles: mergeStrings(result.altTitles, normalized.altTitles),
      description: result.description || normalized.description,
      status: result.status || normalized.status,
      type: result.type || normalized.type,
      originalLanguage: result.originalLanguage || normalized.originalLanguage,
      year: result.year || normalized.year,
      contentRating: result.contentRating || normalized.contentRating,
      coverUrl: result.coverUrl || normalized.coverUrl,
      bannerUrl: result.bannerUrl || normalized.bannerUrl,
      authors: mergeStrings(result.authors, normalized.authors),
      artists: mergeStrings(result.artists, normalized.artists),
      tags: mergeStrings(result.tags, normalized.tags),
      relations: dedupeRelations([
        ...(result.relations || []),
        ...(normalized.relations || []),
      ]),
      links: { ...result.links, ...normalized.links },
      metadata: { ...result.metadata, [candidate.identity.provider]: candidate.rawData || null },
    };
  }, primary);

  const title = await prisma.catalogTitle.upsert({
    where: { normalizedTitle: merged.normalizedTitle },
    create: merged as any,
    update: { ...merged, lastEnrichedAt: new Date() } as any,
  });

  for (const candidate of candidates) {
    await prisma.catalogIdentity.upsert({
      where: {
        provider_externalId: {
          provider: candidate.identity.provider,
          externalId: candidate.identity.externalId,
        },
      },
      create: {
        titleId: title.id,
        provider: candidate.identity.provider,
        externalId: candidate.identity.externalId,
        externalUrl: candidate.identity.externalUrl || null,
        rawData: (candidate.rawData || {}) as any,
      },
      update: {
        titleId: title.id,
        externalUrl: candidate.identity.externalUrl || null,
        rawData: (candidate.rawData || {}) as any,
      },
    });
  }

  return { id: title.id, normalizedTitle: title.normalizedTitle };
}

export async function upsertCatalogChapters(
  titleId: string,
  chapters: CatalogChapterCandidate[]
): Promise<void> {
  for (const chapter of chapters) {
    const language = chapter.language || "en";
    const chapterNumber = chapter.chapterNumber || null;
    const canonicalKey = `${chapterNumber || "unknown"}:${chapter.volumeNumber || ""}`;
    const saved = await prisma.catalogChapter.upsert({
      where: { titleId_canonicalKey_language: { titleId, canonicalKey, language } },
      create: {
        titleId,
        chapterNumber,
        volumeNumber: chapter.volumeNumber || null,
        chapterTitle: chapter.title || null,
        language,
        publishedAt: chapter.publishedAt ? new Date(chapter.publishedAt) : null,
        pages: chapter.pages || 0,
        canonicalKey,
        metadata: (chapter.rawData || {}) as any,
      },
      update: {
        chapterTitle: chapter.title || null,
        publishedAt: chapter.publishedAt ? new Date(chapter.publishedAt) : null,
        pages: chapter.pages || 0,
        metadata: (chapter.rawData || {}) as any,
      },
    });

    await prisma.catalogChapterSource.upsert({
      where: {
        provider_externalId: {
          provider: chapter.identity.provider,
          externalId: chapter.identity.externalId,
        },
      },
      create: {
        chapterId: saved.id,
        provider: chapter.identity.provider,
        externalId: chapter.identity.externalId,
        sourceUrl: chapter.sourceUrl || null,
        pageData: (chapter.pageData || {}) as any,
        rawData: (chapter.rawData || {}) as any,
      },
      update: {
        chapterId: saved.id,
        sourceUrl: chapter.sourceUrl || null,
        pageData: (chapter.pageData || {}) as any,
        rawData: (chapter.rawData || {}) as any,
      },
    });
  }
}
