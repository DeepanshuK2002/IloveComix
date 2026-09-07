"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search as SearchIcon,
  X,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { searchManga } from "@/lib/mangadex";
import { getAllTags } from "@/lib/mangadex";
import type { SearchResult, Tag } from "@/lib/types";
import { MangaGrid } from "@/components/manga/MangaGrid";
import { getTypeColor } from "@/lib/utils";

const TAG_GROUPS: Record<string, string> = {
  theme: "Theme",
  genre: "Genre",
  format: "Format",
  content: "Content",
};

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tag") ? [searchParams.get("tag")!] : []
  );
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    getAllTags().then(setTags).catch(() => {});
  }, []);

  const doSearch = useCallback(
    async (searchQuery: string, searchStatus: string, searchType: string, searchSort: string, searchTags: string[]) => {
      setLoading(true);
      try {
        const res = await searchManga({
          query: searchQuery || undefined,
          includedTags: searchTags.length ? searchTags : undefined,
          status: searchStatus ? [searchStatus as any] : undefined,
          type: searchType ? [searchType as any] : undefined,
          order: (searchSort || "rating") as any,
          limit: 30,
        });
        setResults(res.data);
        setTotal(res.total);
        setHasSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Trigger search on mount with URL params
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const tag = searchParams.get("tag");
    if (q || tag) {
      setQuery(q);
      setSelectedTags(tag ? [tag] : []);
      doSearch(q, "", "", "rating", tag ? [tag] : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (!hasSearched && !query && !selectedTags.length) return;
      if (!query && !selectedTags.length) {
        setResults([]);
        return;
      }
      doSearch(query, status, type, sort, selectedTags);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, type, sort, selectedTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  const groupedTags = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    if (!acc[tag.group]) acc[tag.group] = [];
    acc[tag.group].push(tag);
    return acc;
  }, {});

  const clearAll = () => {
    setQuery("");
    setSelectedTags([]);
    setStatus("");
    setType("");
    setResults([]);
    setHasSearched(false);
  };

  const sortOptions = [
    { value: "rating", label: "Highest Rating" },
    { value: "followedCount", label: "Most Popular" },
    { value: "latestUploadedChapter", label: "Latest Update" },
    { value: "title", label: "Title A-Z" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-6">
          Search <span className="gradient-text">Manga</span>
        </h1>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            doSearch(query, status, type, sort, selectedTags);
            router.push(`/search?q=${encodeURIComponent(query)}`);
          }}
          className="relative"
        >
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, genre, author..."
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            suppressHydrationWarning
            className="w-full rounded-2xl bg-bg-card border border-white/5 py-4 pl-12 pr-28 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-text-primary hover:bg-white/10 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-secondary transition-all"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-8 glass-card rounded-2xl p-6 slide-up">
          {/* Status & Type & Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {["ongoing", "completed", "hiatus", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(status === s ? "" : s)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      status === s
                        ? "bg-accent-primary border-accent-primary text-white"
                        : "bg-white/5 border-white/10 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "ja", label: "Manga", color: "badge-primary" },
                  { value: "ko", label: "Manhwa", color: "badge-secondary" },
                  { value: "zh", label: "Manhua", color: "badge-accent" },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(type === t.value ? "" : t.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      type === t.value
                        ? "bg-accent-primary border-accent-primary text-white"
                        : "bg-white/5 border-white/10 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl bg-bg-card border border-white/5 px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary/50 transition-all"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            {Object.entries(groupedTags).map(([group, groupTags]) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-2">
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                  <span className="text-sm font-semibold text-text-secondary">
                    {TAG_GROUPS[group] || group}
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {groupTags.slice(0, 15).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${
                        selectedTags.includes(tag.id)
                          ? "bg-accent-primary border-accent-primary text-white"
                          : "bg-white/5 border-white/10 text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <span className="text-sm text-text-muted">
              Selected: {selectedTags.length} tags
              {selectedTags.length > 0 &&
                ` • ${selectedTags.length} filter${selectedTags.length === 1 ? "" : "s"}`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-accent-primary transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      {hasSearched && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            Results
            <span className="ml-2 text-sm text-text-muted font-normal">
              {total} found
            </span>
          </h2>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
              Searching...
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading && !hasSearched ? (
        <LoadingGrid />
      ) : results.length > 0 ? (
        <MangaGrid manga={results} />
      ) : hasSearched ? (
        <div className="py-20 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-text-primary text-lg mb-2">No results found</p>
          <p className="text-text-muted text-sm">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-text-muted text-lg">
            Search for manga by title, or use filters to browse
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-bg-card overflow-hidden">
          <div className="aspect-[3/4] animate-pulse bg-bg-secondary" />
          <div className="p-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-bg-secondary mb-2" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}
