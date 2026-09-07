export interface ComixImage {
  id?: string | number;
  hid?: string;
  title?: string;
  poster?: {
    medium?: string;
    large?: string;
    cover?: string;
  };
  contentRating?: string;
}

export interface ComixManga {
  id: string;
  title: string;
  coverUrl: string | null;
  type: string | null;
  status: string | null;
  score: number | null;
  genres: string[];
  chapter: string | null;
  href: string;
  raw: unknown;
}

export interface ComixMangaDetails extends ComixManga {
  synopsis: string | null;
  altTitles: string[];
  authors: string[];
  artists: string[];
  themes: string[];
  groups: ComixGroup[];
  contentRating: string | null;
  year: number | null;
  views: number | null;
  follows: number | null;
  ratingVotes: number | null;
  links: Record<string, string>;
}

export interface ComixListResult<T = ComixManga> {
  items: T[];
  page: number;
  limit: number;
  lastPage: number;
  total: number | null;
}

export interface ComixChapter {
  id: string;
  number: string | null;
  name: string | null;
  language: string | null;
  uploadDate: string | null;
  groupId: string | null;
  groupName: string | null;
  href: string;
  raw: unknown;
}

export interface ComixChapterPage {
  items: ComixChapter[];
  page: number;
  limit: number;
  lastPage: number;
  total: number | null;
}

export interface ComixChapterImages {
  chapterId: string;
  images: string[];
  totalImages: number;
}

export interface ComixGroup {
  id: number | string;
  name: string;
  slug: string | null;
  chapterCount: number | null;
  mangaCount: number | null;
  views: number | null;
  avatar: string | null;
  created: string | null;
  updated: string | null;
  href: string | null;
}

export interface ComixGenreEntry {
  id: number;
  label: string;
  slug: string;
}

export interface ComixGenres {
  genres: ComixGenreEntry[];
  formats: ComixGenreEntry[];
  demographics: ComixGenreEntry[];
}

export interface ComixCollection {
  id: number;
  name: string;
  description: string;
  itemCount: number;
  likeCount: number;
  cover: ComixImage | null;
  created: string | null;
  updated: string | null;
  items: ComixManga[];
}

export interface ComixHomeRail {
  key: string;
  label: string;
  items: ComixManga[];
}

export interface ComixHomeGroup {
  id: string;
  name: string;
  slug: string | null;
  avatar: string | null;
  uploadCount: number | null;
  href: string | null;
}

export interface ComixHome {
  rails: ComixHomeRail[];
  popularGroups: ComixHomeGroup[];
  collections: ComixCollection[];
  raw: unknown;
}

export interface ComixError {
  ok: false;
  status: number;
  message: string;
}

export type ComixSfwOptions = {
  sfw?: boolean;
  page?: number;
  limit?: number;
  types?: string[];
  status?: string;
  genres?: string[];
  contentRating?: string[];
  sort?: string;
  feed?: string;
};