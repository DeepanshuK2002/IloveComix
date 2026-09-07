"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { ComixListResult } from "@/lib/comix/types";
import { ComixMangaGrid } from "@/components/comix/ComixMangaGrid";
import { ComixPagination } from "@/components/comix/ComixPagination";
import { ComixState } from "@/components/comix/ComixState";
import { ComixSfwToggle, useComixSfw } from "@/components/comix/ComixSfwToggle";
import { ComixAttribution } from "@/components/comix/ComixAttribution";

function ComixSkeletonGrid() {
  return (
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
  );
}

export function ComixSearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [debounced, setDebounced] = useState("");
  const [result, setResult] = useState<ComixListResult | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyUpstreamUnknown, setEmptyUpstreamUnknown] = useState(false);
  const [sfw, setSfw] = useComixSfw();
  const seq = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the query input.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(query.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const runSearch = useCallback(
    async (targetQuery: string, targetPage: number, targetSfw: boolean) => {
      if (targetQuery.length < 2) {
        setResult(null);
        setError(null);
        setLoading(false);
        return;
      }
      const id = ++seq.current;
      setLoading(true);
      setError(null);
      setEmptyUpstreamUnknown(false);
      try {
        const url = new URL("/api/comix/search", window.location.origin);
        url.searchParams.set("q", targetQuery);
        url.searchParams.set("page", String(targetPage));
        url.searchParams.set("limit", "24");
        url.searchParams.set("sfw", String(targetSfw));
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);
        const response = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timer);
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error || `Search failed (${response.status})`);
        }
        const body = (await response.json()) as { data: ComixListResult };
        if (id !== seq.current) return;
        setResult(body.data);
        setPage(targetPage);
        // An all-empty result can hide an upstream outage, so note it.
        setEmptyUpstreamUnknown(body.data.items.length === 0);
      } catch (err) {
        if (id !== seq.current) return;
        setError(err instanceof Error ? err.message : "Search failed");
        setResult(null);
      } finally {
        if (id === seq.current) setLoading(false);
      }
    },
    []
  );

  // Refetch whenever the (debounced) query, page, or SFW toggle changes.
  useEffect(() => {
    void runSearch(debounced, page, sfw);
  }, [debounced, page, sfw, runSearch]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasQuery = debounced.length >= 2;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">Comix Search</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Unofficial catalogue of comix.to via the community Comix API.
        </p>
      </header>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setDebounced(query.trim());
          setPage(1);
        }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search manga, manhwa, manhua, webtoons…"
            aria-label="Search the Comix catalogue"
            className="w-full rounded-xl border border-zinc-800 bg-[#141417] py-2.5 pl-10 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" aria-hidden="true" />
          )}
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <ComixSfwToggle sfw={sfw} onChange={setSfw} />
          <button
            type="submit"
            className="rounded-xl bg-[#DF301C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#f33a23] transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>

      {!hasQuery ? (
        <ComixState
          kind="empty"
          title="Start typing to search"
          hint="Enter at least two characters to search the Comix catalogue. Results, types, statuses, scores and cover art are provided via the unofficial Comix API."
        />
      ) : error ? (
        <ComixState
          kind="error"
          title="Search failed"
          hint={`${error} — the unofficial Comix API may be temporarily unavailable. Try again in a moment.`}
          onRetry={() => void runSearch(debounced, page, sfw)}
        />
      ) : loading && !result ? (
        <ComixSkeletonGrid />
      ) : result && result.items.length === 0 ? (
        <ComixState
          kind={emptyUpstreamUnknown ? "unavailable" : "empty"}
          title={emptyUpstreamUnknown ? "No results returned" : `No titles match “${debounced}”`}
          hint={
            emptyUpstreamUnknown
              ? "An empty response can mean the unofficial Comix API could not reach comix.to. If you expected results, please retry shortly."
              : "Try a different spelling or a shorter keyword."
          }
          onRetry={() => void runSearch(debounced, page, sfw)}
        />
      ) : result ? (
        <>
          <ComixMangaGrid items={result.items} />
          <ComixPagination
            page={result.page}
            lastPage={result.lastPage}
            onChange={setPage}
            label="of results"
          />
        </>
      ) : null}

      <ComixAttribution />
    </div>
  );
}