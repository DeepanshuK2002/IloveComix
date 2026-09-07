import {
  comixJson,
  proxyImage,
} from "./client";
import type {
  ComixChapter,
  ComixChapterImages,
  ComixChapterPage,
  ComixCollection,
  ComixGenres,
  ComixGroup,
  ComixHome,
  ComixHomeGroup,
  ComixHomeRail,
  ComixListResult,
  ComixManga,
  ComixMangaDetails,
  ComixSfwOptions,
} from "./types";

function asString(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function toList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

function labelOf(entry: unknown): string | null {
  if (!entry) return null;
  if (typeof entry === "string") return entry.trim() || null;
  if (typeof entry === "object") {
    const obj = entry as Record<string, unknown>;
    return asString(obj.label || obj.name || obj.title || obj.slug);
  }
  return null;
}

function slugFromLink(link: unknown): string | null {
  const value = asString(link);
  if (!value) return null;
  const parts = value.replace(/^\/title\//, "").split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}

function resolveCover(raw: Record<string, unknown>): string | null {
  let cover = raw.cover;
  if (cover && typeof cover === "object") {
    const obj = cover as Record<string, unknown>;
    cover = obj.large || obj.medium || obj.cover || obj.raw || obj.filename;
    if (cover && typeof cover === "object") {
      const nested = cover as Record<string, unknown>;
      cover = nested.large || nested.medium || nested.url || nested.original;
    }
  }
  if (!cover) cover = raw.img || raw.image || raw.thumbnail;
  if (cover && typeof cover === "object") {
    const obj = cover as Record<string, unknown>;
    cover = obj.large || obj.medium || obj.url || obj.original;
  }
  return asString(cover);
}

function scoreOf(raw: Record<string, unknown>): number | null {
  const found =
    raw.score ?? raw.rating ?? raw.score_value ?? raw.bayesian_rating ?? raw.scoreValue;
  const num = asNumber(found ?? null);
  return num;
}

function genreSlugs(raw: Record<string, unknown>): string[] {
  const pooled = [
    ...toList(raw.genres),
    ...toList(raw.tags),
    ...toList(raw.themes),
    ...toList(raw.channels),
  ];
  const out: string[] = [];
  for (const entry of pooled) {
    const label = labelOf(entry);
    if (label && !out.includes(label)) out.push(label);
  }
  return out;
}

function mangaCover(raw: Record<string, unknown>): string | null {
  return proxyImage(resolveCover(raw));
}

export function normalizeManga(raw: unknown): ComixManga | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id =
    asString(item.id) || asString(item.slug) || slugFromLink(item.link || item.url);
  if (!id) return null;
  return {
    id,
    title: asString(item.title) || asString(item.text) || id,
    coverUrl: mangaCover(item),
    type: asString(item.type || item.format || item.kind),
    status: asString(item.status || item.publication_status || item.state),
    score: scoreOf(item),
    genres: genreSlugs(item),
    chapter: asString(item.chapter || item.last_chapter),
    href: `/comix/manga/${id}`,
    raw,
  };
}

interface PaginationSource {
  last_page?: unknown;
  lastPage?: unknown;
  page?: unknown;
  limit?: unknown;
  total?: unknown;
}

function paginationOf(data: unknown): { page: number; limit: number; lastPage: number; total: number | null } {
  const sources: PaginationSource[] = [];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["pagination", "meta", "result"]) {
      const container = obj[key];
      if (container && typeof container === "object") sources.push(container as PaginationSource);
      if (container && typeof container === "object" && typeof (container as Record<string, unknown>).pagination === "object") {
        sources.push((container as Record<string, unknown>).pagination as PaginationSource);
      }
    }
  }
  const pick = (key: keyof PaginationSource) => {
    for (const source of sources) {
      const value = asNumber(source[key]);
      if (value !== null) return value;
    }
    return null;
  };
  const page = pick("page") ?? 1;
  const limit = pick("limit") ?? 20;
  const total = pick("total");
  const lastPage = pick("last_page") ?? pick("lastPage") ?? (total != null ? Math.max(1, Math.ceil(total / limit)) : 1);
  return { page, limit, lastPage, total };
}

function listItemsOf(data: unknown): unknown[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  for (const key of ["result", "results", "data", "items", "manga"]) {
    const value = obj[key];
    if (value && typeof value === "object") {
      const container = value as Record<string, unknown>;
      const items = container.items || container.results || (Array.isArray(value) ? value : null);
      if (Array.isArray(items)) return items;
    }
  }
  return [];
}

export function normalizeList(data: unknown): ComixListResult {
  const { page, limit, lastPage, total } = paginationOf(data);
  const items = listItemsOf(data)
    .map(normalizeManga)
    .filter((item): item is ComixManga => Boolean(item));
  return { items, page, limit, lastPage, total };
}

export function normalizeChapters(data: unknown, mangaId: string): ComixChapterPage {
  const { page, limit, lastPage, total } = paginationOf(data);
  const pool =
    (data && typeof data === "object"
      ? ((data as Record<string, unknown>).result as Record<string, unknown>)?.items
      : null) ||
    (data && typeof data === "object" ? (data as Record<string, unknown>).chapters : null) ||
    (data && typeof data === "object" ? (data as Record<string, unknown>).items : null) ||
    (data && typeof data === "object" ? (data as Record<string, unknown>).results : null) ||
    [];

  const items: ComixChapter[] = (Array.isArray(pool) ? pool : []).map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    const id =
      asString(item.chapterId || item.chapter_id || item.id || item.hid) ||
      asString(item.read || item.read_url);
    const groupRaw = item.scanlation_group || item.group || item.group_name || item.released_by || item.releaser;
    let groupId: string | null = asString(
      item.scanlation_group_id || item.group_id || (groupRaw && typeof groupRaw === "object" ? (groupRaw as Record<string, unknown>).id : null)
    );
    let groupName: string | null = null;
    if (typeof groupRaw === "string") {
      groupName = groupRaw;
    } else if (groupRaw && typeof groupRaw === "object") {
      const obj = groupRaw as Record<string, unknown>;
      groupName = asString(obj.name || obj.label);
      if (!groupId) groupId = asString(obj.id);
    }
    let uploadDate: string | null = asString(
      item.upload_date || item.date || item.released || item.created_at || item.published_at || item.updated_at
    );
    if (!uploadDate) {
      const year = asString(item.upload_year);
      const month = asString(item.upload_month);
      const day = asString(item.upload_day);
      if (year) {
        const mm = month ? month.padStart(2, "0") : "01";
        const dd = day ? day.padStart(2, "0") : "01";
        uploadDate = `${year}-${mm}-${dd}`;
      }
    }
    const number = asString(item.chapter || item.number || item.num) || null;
    const name = asString(item.name || item.title) || null;
    return {
      id: id || "",
      number,
      name: name || (number ? `Chapter ${number}` : "Chapter"),
      language: asString(item.language || item.lang),
      uploadDate,
      groupId,
      groupName,
      href: id ? `/comix/read/${mangaId}/${id}` : `/comix/manga/${mangaId}`,
      raw,
    };
  });

  return { items, page, limit, lastPage, total };
}

export function normalizeRead(data: unknown): ComixChapterImages | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const chapterId = asString(obj.chapterId || obj.chapter_id);
  const rawImages = obj.images || obj.pages || obj.image_urls || obj.ids || [];
  const images: string[] = (Array.isArray(rawImages) ? rawImages : [])
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        const mapped = (entry as Record<string, unknown>).url || (entry as Record<string, unknown>).src || (entry as Record<string, unknown>).img || (entry as Record<string, unknown>).filename || (entry as Record<string, unknown>).file;
        return mapped != null ? String(mapped) : null;
      }
      return null;
    })
    .filter((value): value is string => Boolean(value))
    .map((value) => proxyImage(value) || value);
  const totalImages = asNumber(obj.total_images ?? obj.total) ?? images.length;
  return { chapterId: chapterId || "", images, totalImages };
}

function groupOf(raw: unknown, hrefPrefix: string): ComixGroup | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = asString(item.id || item.group_id || item.slug);
  const name = asString(item.name || item.label) || (typeof item.id === "number" ? `Group ${item.id}` : null);
  if (!name) return null;
  return {
    id: id || name,
    name,
    slug: asString(item.slug),
    chapterCount: asNumber(item.chapter_count ?? item.chapterCount),
    mangaCount: asNumber(item.manga_count ?? item.mangaCount),
    views: asNumber(item.views_total ?? item.views),
    avatar: item.avatar ? proxyImage(asString(item.avatar)) : null,
    created: asString(item.created_at ?? item.created),
    updated: asString(item.updated_at ?? item.updated),
    href: id ? `${hrefPrefix}/${id}` : null,
  };
}

export function normalizeGroups(data: unknown): ComixGroup[] {
  const pool =
    (data && typeof data === "object" ? (data as Record<string, unknown>).results : null) ||
    (data && typeof data === "object" ? (data as Record<string, unknown>).groups : null) ||
    [];
  return (Array.isArray(pool) ? pool : [])
    .map((item) => groupOf(item, "/comix/groups"))
    .filter((group): group is ComixGroup => Boolean(group));
}

export function normalizeGenres(data: unknown): ComixGenres {
  const empty: ComixGenres = { genres: [], formats: [], demographics: [] };
  if (!data || typeof data !== "object") return empty;
  const obj = data as Record<string, unknown>;
  const map = (key: string) =>
    toList(obj[key])
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const e = entry as Record<string, unknown>;
        const label = asString(e.label || e.name);
        const slug = asString(e.slug);
        const id = asNumber(e.id);
        return label ? { id: id ?? 0, label, slug: slug || label } : null;
      })
      .filter((entry): entry is ComixGenres["genres"][number] => Boolean(entry));
  return { genres: map("genres"), formats: map("formats"), demographics: map("demographics") };
}

export function normalizeHome(data: unknown): ComixHome | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const rails: ComixHomeRail[] = [];
  const railConfig: [string, string][] = [
    ["popular", "Trending Now"],
    ["latest", "Latest Updates"],
    ["recentlyAdded", "Recently Added"],
    ["completed", "Recent Completions"],
  ];
  for (const [key, label] of railConfig) {
    const items = toList(obj[key])
      .map(normalizeManga)
      .filter((item): item is ComixManga => Boolean(item));
    rails.push({ key, label, items });
  }
  const popularGroups: ComixHomeGroup[] = toList(obj.popularGroups)
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const id = asString(item.id);
      const name = asString(item.name);
      if (!name) return null;
      return {
        id: id || name,
        name,
        slug: asString(item.slug),
        avatar: item.avatar ? proxyImage(asString(item.avatar)) : null,
        uploadCount: asNumber(item.upload_count ?? item.uploadCount),
        href: asString(item.link) ? asString(item.link)!.replace("/api/manga/groups?keyword=", "/comix/groups?keyword=") : id ? `/comix/groups/${id}` : null,
      };
    })
    .filter((group): group is ComixHomeGroup => Boolean(group));
  const collections: ComixCollection[] = toList(obj.collections)
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const id = asNumber(item.id);
      if (!id) return null;
      const coverRaw = item.cover && typeof item.cover === "object" ? (item.cover as Record<string, unknown>) : null;
      const collection: ComixCollection = {
        id,
        name: asString(item.name) || `Collection #${id}`,
        description: asString(item.description) || "",
        itemCount: asNumber(item.item_count ?? item.itemCount) ?? 0,
        likeCount: asNumber(item.like_count ?? item.likeCount) ?? 0,
        cover: coverRaw
          ? {
              id: coverRaw.id != null ? Number(coverRaw.id) : undefined,
              hid: asString(coverRaw.hid) || undefined,
              title: asString(coverRaw.title) || undefined,
              poster: coverRaw.poster && typeof coverRaw.poster === "object"
                ? {
                    medium: proxyImage(asString((coverRaw.poster as Record<string, unknown>).medium)) || undefined,
                    large: proxyImage(asString((coverRaw.poster as Record<string, unknown>).large)) || undefined,
                  }
                : undefined,
              contentRating: asString(coverRaw.contentRating) || undefined,
            }
          : null,
        created: asString(item.created_at),
        updated: asString(item.updated_at),
        items: [],
      };
      return collection;
    })
    .filter((collection): collection is ComixCollection => Boolean(collection));
  return { rails, popularGroups, collections, raw: data };
}

export function normalizeCollection(data: unknown, id: number): ComixCollection | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const collection = (
    obj.collection && typeof obj.collection === "object"
      ? (obj.collection as unknown as Record<string, unknown>)
      : obj
  ) as Record<string, unknown>;
  const cid = asNumber(collection.id) ?? id;
  return {
    id: cid,
    name: asString(collection.name) || `Collection #${cid}`,
    description: asString(collection.description) || "",
    itemCount: asNumber(collection.itemCount ?? collection.item_count) ?? 0,
    likeCount: asNumber(collection.likeCount ?? collection.like_count) ?? 0,
    cover: null,
    created: asString(collection.createdAtFormatted ?? collection.created_at),
    updated: asString(collection.updatedAtFormatted ?? collection.updated_at),
    items: normalizeList(data).items,
  };
}

export function normalizeDetails(data: unknown): ComixMangaDetails | null {
  if (!data || typeof data !== "object") return null;
  let doc: Record<string, unknown> = data as Record<string, unknown>;
  if (doc.data && typeof doc.data === "object" && !Array.isArray(doc.data)) {
    doc = doc.data as unknown as Record<string, unknown>;
  }
  const id =
    asString(doc.id) || asString(doc.slug) || slugFromLink(doc.link || doc.url);
  if (!id) return null;
  const nameList = (source: unknown): string[] => {
    const out: string[] = [];
    for (const entry of toList(source)) {
      const label = labelOf(entry);
      if (label && !out.includes(label)) out.push(label);
    }
    if (typeof source === "string") {
      for (const piece of source.split(/[,;·]/)) {
        const trimmed = piece.trim();
        if (trimmed && !out.includes(trimmed)) out.push(trimmed);
      }
    }
    return out;
  };
  const groups: ComixGroup[] = [];
  for (const entry of toList(doc.groups || doc.scanlation_groups || doc.scanlators || doc.uploaders)) {
    if (typeof entry === "string") {
      groups.push({ id: entry, name: entry, slug: null, chapterCount: null, mangaCount: null, views: null, avatar: null, created: null, updated: null, href: `/comix/groups?keyword=${encodeURIComponent(entry)}` });
    } else if (entry && typeof entry === "object") {
      const group = groupOf(entry, "/comix/groups");
      if (group) groups.push(group);
    }
  }
  const links: Record<string, string> = {};
  if (doc.links && typeof doc.links === "object") {
    for (const [key, value] of Object.entries(doc.links as Record<string, unknown>)) {
      const str = asString(value);
      if (str) links[key] = str;
    }
  }
  return {
    id,
    title: asString(doc.title) || asString(doc.romanized_title) || id,
    coverUrl: mangaCover(doc),
    type: asString(doc.type || doc.format || doc.kind),
    status: asString(doc.status || doc.publication_status || doc.state),
    score: scoreOf(doc),
    genres: genreSlugs(doc),
    chapter: asString(doc.last_chapter || doc.chapter),
    href: `/comix/manga/${id}`,
    synopsis: asString(doc.synopsis || doc.description || doc.summary || doc.bio),
    altTitles: nameList(doc.alt_titles || doc.titles || doc.alternative_titles),
    authors: nameList(doc.authors || doc.author || doc.creators),
    artists: nameList(doc.artists || doc.artist || doc.illustrators),
    themes: nameList(doc.themes || doc.tags_extra),
    groups,
    contentRating: asString(doc.content_rating || doc.contentRating),
    year: asNumber(doc.year ?? doc.release_year ?? doc.start_year),
    views: asNumber(doc.views_total ?? doc.views ?? doc.view_count),
    follows: asNumber(doc.follows_total ?? doc.follows ?? doc.follow_count),
    ratingVotes: asNumber(doc.rating_votes ?? doc.ratingCount ?? doc.votes),
    links,
    raw: data,
  };
}

export async function searchComix(
  query: string,
  options: ComixSfwOptions = {}
): Promise<ComixListResult> {
  const data = await comixJson<unknown>("/manga/search", {
    q: query,
    sfw: options.sfw ?? true,
    page: options.page ?? 1,
    limit: options.limit ?? 20,
    types: options.types,
    status: options.status,
    genres: options.genres,
    content_rating: options.contentRating,
  });
  return normalizeList(data);
}

export async function getComixManga(
  id: string,
  sfw = true
): Promise<ComixMangaDetails | null> {
  const data = await comixJson<unknown>(`/manga/${encodeURIComponent(id)}`, { sfw }, { ttlMs: 120_000 });
  return normalizeDetails(data);
}

export async function getComixChapters(
  mangaId: string,
  options: { page?: number; limit?: number; groupId?: string | number; sfw?: boolean } = {}
): Promise<ComixChapterPage> {
  const data = await comixJson<unknown>(
    `/manga/${encodeURIComponent(mangaId)}/chapters`,
    {
      page: options.page ?? 1,
      limit: options.limit ?? 30,
      scanlation_group_id: options.groupId,
    },
    { ttlMs: 60_000 }
  );
  return normalizeChapters(data, mangaId);
}

export async function readComixChapter(
  chapterId: string
): Promise<ComixChapterImages | null> {
  const data = await comixJson<unknown>(
    "/manga/read",
    { chapterId },
    { ttlMs: 300_000 }
  );
  return normalizeRead(data);
}

export async function browseComix(options: ComixSfwOptions = {}): Promise<ComixListResult> {
  const data = await comixJson<unknown>("/manga/browse", {
    feed: options.feed,
    sort: options.sort,
    sfw: options.sfw ?? true,
    content_rating: options.contentRating,
    page: options.page ?? 1,
    limit: options.limit ?? 20,
  });
  return normalizeList(data);
}

export async function filterComix(options: ComixSfwOptions = {}): Promise<ComixListResult> {
  const data = await comixJson<unknown>("/manga/filter", {
    genres: options.genres?.join(","),
    sfw: options.sfw ?? true,
    content_rating: options.contentRating,
    page: options.page ?? 1,
    limit: options.limit ?? 20,
  });
  return normalizeList(data);
}

export async function listComixGenres(): Promise<ComixGenres> {
  const data = await comixJson<unknown>("/manga/genres", {}, { ttlMs: 6 * 60 * 60_000 });
  return normalizeGenres(data);
}

export async function listComixGroups(options: {
  keyword?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ComixGroup[]> {
  const data = await comixJson<unknown>(
    "/manga/groups",
    { keyword: options.keyword, page: options.page ?? 1, limit: options.limit ?? 20 },
    { ttlMs: 60_000 }
  );
  return normalizeGroups(data);
}

export async function getComixHome(): Promise<ComixHome | null> {
  const data = await comixJson<unknown>("/manga/home", {}, { ttlMs: 60_000 });
  return normalizeHome(data);
}

export async function listComixCollections(options: { page?: number; limit?: number } = {}): Promise<ComixCollection[]> {
  const data = await comixJson<unknown>(
    "/manga/collections",
    { page: options.page ?? 1, limit: options.limit ?? 12 },
    { ttlMs: 60_000 }
  );
  if (!data || typeof data !== "object") return [];
  const pool = (data as Record<string, unknown>).results || [];
  return (Array.isArray(pool) ? pool : [])
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      return normalizeCollection({ collection: item, results: [] }, asNumber(item.id) ?? 0);
    })
    .filter((collection): collection is ComixCollection => Boolean(collection));
}

export async function getComixCollection(id: number): Promise<ComixCollection | null> {
  const data = await comixJson<unknown>(
    `/manga/collections/${id}`,
    {},
    { ttlMs: 120_000 }
  );
  return normalizeCollection(data, id);
}