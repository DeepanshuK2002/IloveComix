import type { SearchResult } from "./types";

if (typeof window === "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require("dns");
    if (typeof dns?.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch {}
}

// In-memory cache for resolved banner wallpaper URLs
const bannerCache = new Map<string, string | null>();

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 3000
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Fetch horizontal wallpaper banner for a single manga item
 */
export async function getBannerForManga(
  id: string,
  title?: string,
  links?: Record<string, string>
): Promise<string | null> {
  const cached = bannerCache.get(id);
  if (cached) {
    return cached;
  }

  // 1. Try AniList by ID (manga)
  const alId = links?.al ? parseInt(links.al, 10) : null;
  if (alId && !isNaN(alId)) {
    try {
      const query = `query ($id: Int) {
        Media(id: $id, type: MANGA) {
          bannerImage
        }
      }`;
      const res = await fetchWithTimeout(
        "https://graphql.anilist.co",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": DEFAULT_UA,
          },
          body: JSON.stringify({ query, variables: { id: alId } }),
        },
        2500
      );
      if (res && res.ok) {
        const data = await res.json();
        const banner = data.data?.Media?.bannerImage;
        if (banner) {
          bannerCache.set(id, banner);
          return banner;
        }
      }
    } catch {}

    // 2. Try AniList by ID (anime)
    try {
      const query = `query ($id: Int) {
        Media(id: $id, type: ANIME) {
          bannerImage
        }
      }`;
      const res = await fetchWithTimeout(
        "https://graphql.anilist.co",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": DEFAULT_UA,
          },
          body: JSON.stringify({ query, variables: { id: alId } }),
        },
        2500
      );
      if (res && res.ok) {
        const data = await res.json();
        const banner = data.data?.Media?.bannerImage;
        if (banner) {
          bannerCache.set(id, banner);
          return banner;
        }
      }
    } catch {}
  }

  // 3. Try AniList by title search
  if (title) {
    try {
      const query = `query ($search: String) {
        manga: Media(search: $search, type: MANGA) {
          bannerImage
        }
        anime: Media(search: $search, type: ANIME) {
          bannerImage
        }
      }`;
      const res = await fetchWithTimeout(
        "https://graphql.anilist.co",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": DEFAULT_UA,
          },
          body: JSON.stringify({ query, variables: { search: title } }),
        },
        2500
      );
      if (res && res.ok) {
        const data = await res.json();
        const banner =
          data.data?.manga?.bannerImage || data.data?.anime?.bannerImage;
        if (banner) {
          bannerCache.set(id, banner);
          return banner;
        }
      }
    } catch {}
  }

  // 4. Try Kitsu if kt link exists
  if (links?.kt) {
    try {
      const res = await fetchWithTimeout(
        `https://kitsu.io/api/edge/manga/${links.kt}`,
        {
          headers: {
            "User-Agent": DEFAULT_UA,
            Accept: "application/vnd.api+json",
          },
        },
        2500
      );
      if (res && res.ok) {
        const data = await res.json();
        const cover =
          data.data?.attributes?.coverImage?.original ||
          data.data?.attributes?.coverImage?.large;
        if (cover) {
          bannerCache.set(id, cover);
          return cover;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Attach horizontal wallpaper banners to a list of Manga SearchResults.
 * Uses batch AniList GraphQL for single-roundtrip speed, with intelligent fallbacks.
 */
export async function attachBannersToMangaList(
  items: SearchResult[]
): Promise<SearchResult[]> {
  if (!items || items.length === 0) return items;

  const results = items.map((item) => ({ ...item }));
  const missing: { index: number; item: SearchResult }[] = [];

  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    if (bannerCache.has(item.id)) {
      item.bannerUrl = bannerCache.get(item.id);
    } else {
      missing.push({ index: i, item });
    }
  }

  if (missing.length === 0) return results;

  // 1. Batch AniList query for items with valid links.al
  const alItems = missing.filter(
    (m) => m.item.links?.al && !isNaN(parseInt(m.item.links.al, 10))
  );
  const alIds = Array.from(
    new Set(alItems.map((m) => parseInt(m.item.links!.al!, 10)))
  );

  if (alIds.length > 0) {
    try {
      const query = `query ($ids: [Int]) {
        Page(page: 1, perPage: 50) {
          media(id_in: $ids, type: MANGA) {
            id
            bannerImage
          }
        }
      }`;
      const res = await fetchWithTimeout(
        "https://graphql.anilist.co",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": DEFAULT_UA,
          },
          body: JSON.stringify({ query, variables: { ids: alIds } }),
        },
        3000
      );

      if (res && res.ok) {
        const data = await res.json();
        const map = new Map<number, string>();
        for (const media of data.data?.Page?.media || []) {
          if (media.bannerImage) {
            map.set(media.id, media.bannerImage);
          }
        }
        for (const m of alItems) {
          const alId = parseInt(m.item.links!.al!, 10);
          if (map.has(alId)) {
            const banner = map.get(alId)!;
            results[m.index].bannerUrl = banner;
            bannerCache.set(m.item.id, banner);
          }
        }
      }
    } catch {}
  }

  // 2. Fallback for any items that still don't have a banner
  const stillMissing = missing.filter((m) => !results[m.index].bannerUrl);
  if (stillMissing.length > 0) {
    // Process up to 5 missing items concurrently
    await Promise.allSettled(
      stillMissing.slice(0, 5).map(async (m) => {
        const banner = await getBannerForManga(
          m.item.id,
          m.item.title,
          m.item.links
        );
        if (banner) {
          results[m.index].bannerUrl = banner;
        }
      })
    );
  }

  return results;
}
