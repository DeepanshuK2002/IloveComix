"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ComixGenres, ComixListResult } from "@/lib/comix/types";
import { ComixMangaGrid } from "@/components/comix/ComixMangaGrid";
import { ComixPagination } from "@/components/comix/ComixPagination";
import { ComixState } from "@/components/comix/ComixState";
import { ComixSfwToggle, useComixSfw } from "@/components/comix/ComixSfwToggle";
import { ComixAttribution } from "@/components/comix/ComixAttribution";

const SORTS: { value: string; label: string }[] = [
  { value: "chapter_updated_at:desc", label: "Recently updated" },
  { value: "created_at:desc", label: "Newly added" },
  { value: "views_7d:desc", label: "Trending (7d)" },
  { value: "follows_total:desc", label: "Most followed" },
  { value: "score:desc", label: "Top rated" },
  { value: "year:desc", label: "Newest year" },
  { value: "title:asc", label: "Title A–Z" },
  { value: "relevance:desc", label: "Relevance" },
];

const FEEDS: { value: string | ""; label: string }[] = [
  { value: "", label: "Full catalogue" },
  { value: "trending-manga", label: "Trending manga" },
  { value: "trending-webtoon", label: "Trending webtoon" },
];

export function ComixBrowsePage() {
  const searchParams = useSearchParams();
  const [genres, setGenres] = useState<ComixGenres["genres"]>([]);
  const [selected, setSelected] = useState<string[]>(
    () => (searchParams.get("genres") ?? "").split(",").filter(Boolean)
  );
  const [sort, setSort] = useState(SORTS[0].value);
  const [feed, setFeed] = useState(searchParams.get("feed") ?? "");
  const [result, setResult] = useState<ComixListResult | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sfw, setSfw] = useComixSfw();
  const seq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/comix/genres")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((body) => {
        if (!cancelled) setGenres((body.data as ComixGenres)?.genres ?? []);
      })
      .catch(() => {
        if (!cancelled) setGenres([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(
    async (targetPage: number, targetSfw: boolean) => {
      const id = ++seq.current;
      setLoading(true);
      setError(null);
      try {
        const useFilter = selected.length > 0 && !feed;
        const url = new URL(
          useFilter ? "/api/comix/filter" : "/api/comix/browse",
          window.location.origin
        );
        if (useFilter) url.searchParams.set("genres", selected.join(","));
        if (!useFilter && feed) url.searchParams.set("feed", feed);
        if (!useFilter && !feed) url.searchParams.set("sort", sort);
        url.searchParams.set("page", String(targetPage));
        url.searchParams.set("limit", "24");
        url.searchParams.set("sfw", String(targetSfw));
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);
        const response = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timer);
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error || `Browse failed (${response.status})`);
        }
        const body = (await response.json()) as { data: ComixListResult };
        if (id !== seq.current) return;
        setResult(body.data);
        setPage(targetPage);
      } catch (err) {
        if (id !== seq.current) return;
        setError(err instanceof Error ? err.message : "Browse failed");
        setResult(null);
      } finally {
        if (id === seq.current) setLoading(false);
      }
    },
    [selected, sort, feed]
  );

  useEffect(() => {
    void run(1, sfw);
  }, [selected, sort, feed, sfw, run]);

  const toggleGenre = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const placeholderGrid = loading && !result;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">Comix Browse</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Browse the full comix.to catalogue, filter by genre, and sort.
          </p>
        </div>
        <ComixSfwToggle sfw={sfw} onChange={setSfw} />
      </header>

      <section className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="comix-feed" className="text-xs font-semibold text-zinc-400">Feed</label>
          <select
            id="comix-feed"
            value={feed}
            onChange={(event) => {
              setFeed(event.target.value);
              if (event.target.value) setSelected([]);
            }}
            className="rounded-lg border border-zinc-800 bg-[#141417] px-3 py-2 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none"
          >
            {FEEDS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label htmlFor="comix-sort" className="text-xs font-semibold text-zinc-400">Sort</label>
          <select
            id="comix-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            disabled={Boolean(feed)}
            className="rounded-lg border border-zinc-800 bg-[#141417] px-3 py-2 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none disabled:opacity-50"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-500">
            {selected.length > 0 ? `${selected.length} genre(s)` : "all genres"}
          </span>
        </div>

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Genres">
            {genres.map((genre) => {
              const active = selected.includes(genre.slug);
              return (
                <button
                  key={genre.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleGenre(genre.slug)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none cursor-pointer ${
                    active
                      ? "border-[#DF301C] bg-[#DF301C]/15 text-[#FF453A]"
                      : "border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  {genre.label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {error ? (
        <ComixState
          kind="error"
          title="Browse failed"
          hint={`${error} — the unofficial Comix API may be temporarily unavailable. Try again in a moment.`}
          onRetry={() => void run(1, sfw)}
        />
      ) : placeholderGrid ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="animate-pulse overflow-hidden rounded-xl border border-zinc-800/80 bg-[#141417]">
              <div className="aspect-[2/3] w-full bg-zinc-800/70" />
              <div className="space-y-2 p-2.5">
                <div className="h-3 rounded bg-zinc-800" />
                <div className="h-3 w-2/3 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      ) : result && result.items.length === 0 ? (
        <ComixState
          kind="unavailable"
          title="No titles returned"
          hint="The catalogue query came back empty. The unofficial Comix API may be temporarily unavailable upstream, or no titles match the current filters."
          onRetry={() => void run(1, sfw)}
        />
      ) : result ? (
        <>
          <ComixMangaGrid items={result.items} />
          <ComixPagination
            page={result.page}
            lastPage={result.lastPage}
            onChange={setPage}
            label="of titles"
          />
        </>
      ) : null}

      <ComixAttribution />
    </div>
  );
}