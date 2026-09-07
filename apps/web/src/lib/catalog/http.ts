const DEFAULT_UA = "Ilovecomix-Catalog/1.0";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export interface FetchOptions extends RequestInit {
  revalidate?: number;
  timeoutMs?: number;
  userAgent?: "browser" | "default" | string;
  accept?: string;
}

export async function fetchRaw(url: string, init: FetchOptions = {}): Promise<Response> {
  const { revalidate = 3600, timeoutMs = 20000, userAgent, accept, ...requestInit } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const ua =
      typeof userAgent === "string" && userAgent !== "default"
        ? userAgent === "browser"
          ? BROWSER_UA
          : userAgent
        : DEFAULT_UA;
    return await fetch(url, {
      ...requestInit,
      headers: {
        Accept: accept ?? "application/json, text/plain, */*",
        "User-Agent": ua,
        ...requestInit.headers,
      },
      next: { revalidate },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(url: string, init?: FetchOptions): Promise<T> {
  const response = await fetchRaw(url, {
    ...init,
    accept: init?.accept ?? "application/json, text/plain, */*",
  });
  if (!response.ok) {
    throw new Error(`Catalog provider returned ${response.status}: ${url}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchHtml(url: string, init?: FetchOptions): Promise<string> {
  const response = await fetchRaw(url, {
    ...init,
    accept: "text/html,application/xhtml+xml,*/*;q=0.8",
  });
  if (!response.ok) {
    throw new Error(`Catalog provider returned ${response.status}: ${url}`);
  }
  return response.text();
}

export function normalizeCatalogTitle(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function stripHtml(value: string | null | undefined): string | null {
  if (!value) return null;
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim() || null;
}

const ENTITY_RE = /&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g;
export function decodeEntities(value: string): string {
  return value.replace(ENTITY_RE, (match, entity) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" || entity[1] === "X"
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10);
      return isNaN(code) ? match : String.fromCodePoint(code);
    }
    const named: Record<string, string> = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
      nbsp: " ",
      mdash: "—",
      ndash: "–",
      hellip: "…",
      rsquo: "\u2019",
      lsquo: "\u2018",
      rdquo: "\u201D",
      ldquo: "\u201C",
    };
    return named[entity] ?? match;
  });
}

function tokenize(value: string): string[] {
  return normalizeCatalogTitle(value).split(/\s+/).filter(Boolean);
}

/** Token-dice similarity between two titles (0..1). */
export function titleSimilarity(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (!ta.length || !tb.length) return 0;
  const setB = new Set(tb);
  let hits = 0;
  for (const token of ta) if (setB.has(token)) hits++;
  return (2 * hits) / (ta.length + tb.length);
}

/** True when a candidate title plausibly refers to the queried series. */
export function matchesTitle(query: string, candidate: string, threshold = 0.55): boolean {
  const q = normalizeCatalogTitle(query);
  const c = normalizeCatalogTitle(candidate);
  if (!q || !c) return false;
  return q === c || titleSimilarity(q, c) >= threshold;
}

/** Decode common HTML entities in a string, stripping tags alongside. */
export function cleanText(value: string | null | undefined): string | null {
  return stripHtml(decodeEntities(value || ""));
}