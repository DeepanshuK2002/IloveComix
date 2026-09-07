const COMIX_API_BASE = "https://comix-api.vercel.app/api";
const COMIX_UPSTREAM = "https://comix-api.vercel.app";
const COMIX_SITE = "https://comix.to";

const USER_AGENT =
  "Ilovecomix-RS/1.0 (+https://ilovecomix.app; unofficial Comix reader)";

type Params = Record<string, string | number | boolean | string[] | undefined>;

interface CacheEntry {
  expires: number;
  data: unknown;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(url: string): string {
  return `comix:${url}`;
}

async function fetchWithRetry(url: string, timeoutMs: number): Promise<Response> {
  let lastError: Error | null = null;
  const attempts = [0, 350, 1000];
  for (const delay of attempts) {
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json",
          },
          signal: controller.signal,
          cache: "no-store",
        });
        if (response.status >= 500 || response.status === 429) {
          lastError = new Error(`Upstream responded ${response.status}`);
          continue;
        }
        return response;
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw lastError ?? new Error("Request failed");
}

export async function comixJson<T>(
  path: string,
  params: Params = {},
  opts: { ttlMs?: number; timeoutMs?: number } = {}
): Promise<T | null> {
  const url = new URL(`${COMIX_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const entry of value) url.searchParams.append(`${key}[]`, String(entry));
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  const ttlMs = opts.ttlMs ?? 60_000;
  const full = url.toString();
  const key = cacheKey(full);

  const current = cache.get(key);
  if (current && current.expires > Date.now()) {
    return current.data as T;
  }

  const response = await fetchWithRetry(full, opts.timeoutMs ?? 15_000);
  const text = await response.text();

  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (response.status < 200 || response.status >= 300) {
    // Non-2xx: remember the error but return it so callers can degrade.
    cache.set(key, {
      expires: Date.now() + Math.min(ttlMs, 5_000),
      data: parsed ?? { error: `HTTP ${response.status}` },
    });
  } else {
    cache.set(key, { expires: Date.now() + ttlMs, data: parsed });
  }
  return parsed as T | null;
}

/** Deterministic cache flush for the whole upstream (used by tests / dev). */
export function clearComixCache(): void {
  cache.clear();
}

/** Rewrites any CDN image URL to our same-origin proxy endpoint. */
export function proxyImage(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  if (src.startsWith("/api/comix/image")) return src;
  return `/api/comix/image?url=${encodeURIComponent(src)}`;
}

export { COMIX_API_BASE, COMIX_UPSTREAM, COMIX_SITE };