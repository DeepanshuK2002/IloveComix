export type CatalogProviderId =
  | "mangabaka"
  | "mangadex"
  | "anilist"
  | "mangaupdates"
  | "myanimelist"
  | "kitsu"
  | "shikimori"
  | "animeplanet"
  | "anidb"
  | "ann"
  | "simkl";

export interface CatalogSearchOptions {
  genre?: string;
  status?: string;
  licensed?: boolean;
}

export interface CatalogIdentity {
  provider: CatalogProviderId;
  externalId: string;
  externalUrl?: string | null;
}

export interface CatalogCandidate {
  identity: CatalogIdentity;
  title: string;
  altTitles?: string[];
  description?: string | null;
  status?: string | null;
  type?: string | null;
  originalLanguage?: string | null;
  year?: number | null;
  contentRating?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  authors?: string[];
  artists?: string[];
  tags?: string[];
  relations?: {
    relation: string;
    provider: CatalogProviderId;
    externalId: string;
    externalUrl?: string | null;
  }[];
  links?: Record<string, string>;
  rawData?: unknown;
  confidence?: number;
}

export interface CatalogProvider {
  id: CatalogProviderId;
  kind: "primary" | "enrichment";
  search(query: string, options?: CatalogSearchOptions): Promise<CatalogCandidate[]>;
  get?(identity: CatalogIdentity): Promise<CatalogCandidate | null>;
}

export interface NormalizedCatalogTitle {
  canonicalTitle: string;
  altTitles: string[];
  normalizedTitle: string;
  description: string | null;
  status: string | null;
  type: string | null;
  originalLanguage: string | null;
  year: number | null;
  contentRating: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  authors: string[];
  artists: string[];
  tags: string[];
  relations: CatalogCandidate["relations"];
  links: Record<string, string>;
  metadata: Record<string, unknown>;
}

export interface CatalogChapterCandidate {
  identity: CatalogIdentity;
  chapterNumber?: string | null;
  volumeNumber?: string | null;
  title?: string | null;
  language?: string;
  publishedAt?: string | null;
  pages?: number;
  sourceUrl?: string | null;
  pageData?: unknown;
  rawData?: unknown;
}
