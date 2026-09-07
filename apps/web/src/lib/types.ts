export interface Manga {
  id: string;
  title: string;
  altTitles: string[];
  description: string;
  status: "ongoing" | "completed" | "hiatus" | "cancelled";
  year: number | null;
  contentRating: "safe" | "suggestive" | "erotica" | "pornographic";
  type: "manga" | "manhwa" | "manhua" | "oel" | null;
  originalLanguage?: string;
  tags: Tag[];
  coverUrl: string | null;
  bannerUrl?: string | null;
  authors: string[];
  artists: string[];
  followingCount: number;
  rating: number;
  score?: number;
  votesCount?: number;
  rank?: number;
  links?: Record<string, string>;
  /** Localized titles keyed by language code (e.g. "en", "ja", "ja-ro") */
  localizedTitle?: Record<string, string>;
  /** Localized descriptions keyed by language code */
  localizedDescription?: Record<string, string>;
}

export interface Tag {
  id: string;
  name: string;
  group: string;
}

export interface Chapter {
  id: string;
  title: string | null;
  volume: string | null;
  chapter: string | null;
  pages: number;
  publishAt: string;
  scanlationGroup: string | null;
  translatedLanguage: string;
  externalUrl?: string | null;
  source?: string;
  sourceName?: string;
  seriesId?: string;
  externalHref?: string;
  readUrl?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  altTitles: string[];
  description: string;
  status: Manga["status"];
  year: number | null;
  contentRating: Manga["contentRating"];
  type: Manga["type"];
  tags: Tag[];
  coverUrl: string | null;
  bannerUrl?: string | null;
  rating: number;
  followingCount: number;
  rank?: number;
  lastChapter?: string | null;
  updatedAt?: string | null;
  links?: Record<string, string>;
}

export interface SearchFilters {
  query?: string;
  includedTags?: string[];
  excludedTags?: string[];
  status?: Manga["status"][];
  type?: (Manga["type"] | string)[];
  year?: { from?: number; to?: number };
  order?: "rating" | "followedCount" | "latestUploadedChapter" | "title" | "relevance" | "createdAt";
  limit?: number;
  offset?: number;
  contentRating?: Manga["contentRating"][];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
