"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { searchManga, getAllTags, toHighResCoverUrl } from "@/lib/mangadex";
import type { SearchResult, Tag } from "@/lib/types";
import { MangaGrid } from "@/components/manga/MangaGrid";
import { getUserSettings } from "@/lib/settings";
import { isAdultTagName, hasAdultTags } from "@/lib/adultTags";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Loader2,
  LayoutGrid,
  List,
  RotateCcw,
  Users,
  Star,
  BookOpen,
} from "lucide-react";

const TAG_GROUPS: Record<string, string> = {
  genre: "Genre",
  theme: "Theme",
  format: "Format",
  content: "Content",
};

const PAGE_SIZE = 24;

const ADULT_PRIORITY_TAGS = [
  "smut",
  "hentai",
  "erotica",
  "doujinshi",
  "sexual violence",
  "ecchi",
  "romance",
  "harem",
  "drama",
  "psychological",
  "mature",
  "incest",
  "cheating",
  "office workers",
];

const YEAR_PRESETS = [
  { value: "all", label: "All Years" },
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2020-2023", label: "2020–2023" },
  { value: "2010s", label: "2010s" },
  { value: "2000s", label: "2000s" },
  { value: "classic", label: "Classics" },
];

function parseYearRange(range: string): { from?: number; to?: number } | undefined {
  if (!range || range === "all") return undefined;
  if (range === "2026") return { from: 2026, to: 2026 };
  if (range === "2025") return { from: 2025, to: 2025 };
  if (range === "2024") return { from: 2024, to: 2024 };
  if (range === "2020-2023") return { from: 2020, to: 2023 };
  if (range === "2010s") return { from: 2010, to: 2019 };
  if (range === "2000s") return { from: 2000, to: 2009 };
  if (range === "classic") return { from: 1950, to: 1999 };
  const num = parseInt(range);
  if (!isNaN(num)) return { from: num, to: num };
  return undefined;
}

export function BrowsePage() {
  const searchParams = useSearchParams();

  // Search & Type dropdown state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [type, setType] = useState(""); // "" (All) | "ja" (Manga) | "ko" (Manhwa) | "zh" (Manhua) | "other" (Other)

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("followedCount");
  const [yearRange, setYearRange] = useState("all");
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Data State
  const [manga, setManga] = useState<SearchResult[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [contentFilter, setContentFilter] = useState<string>("suggestive");

  const isAdultMode = contentFilter === "pornographic";
  const adultModeRef = useRef(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Hentai-related tags/results only appear while the Pornographic filter is on.
  const filterResults = useCallback(
    (list: SearchResult[]) =>
      adultModeRef.current ? list : list.filter((m) => !hasAdultTags(m.tags)),
    []
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load tags and content filter
  useEffect(() => {
    getAllTags().then(setTags).catch(() => {});
    setContentFilter(getUserSettings().contentFilter);

    const onSettingsChange = (e: any) => {
      const updated = e.detail?.contentFilter || getUserSettings().contentFilter;
      adultModeRef.current = updated === "pornographic";
      setContentFilter(updated);
    };
    window.addEventListener("ilovecomix-settings-changed", onSettingsChange);
    return () => {
      window.removeEventListener("ilovecomix-settings-changed", onSettingsChange);
    };
  }, []);

  // Keep the ref in sync on the initial load too.
  useEffect(() => {
    adultModeRef.current = contentFilter === "pornographic";
  }, [contentFilter]);

  // Load initial filters from URL params on mount
  useEffect(() => {
    const qParam = searchParams.get("q");
    const typeParam = searchParams.get("type");
    const statusParam = searchParams.get("status");
    const orderParam = searchParams.get("order");
    const tagParam = searchParams.get("tag");
    const yearParam = searchParams.get("year");

    if (qParam) {
      setSearchQuery(qParam);
      setDebouncedQuery(qParam);
    }
    if (typeParam) {
      if (typeParam === "manga" || typeParam === "ja") setType("ja");
      else if (typeParam === "manhwa" || typeParam === "ko") setType("ko");
      else if (typeParam === "manhua" || typeParam === "zh") setType("zh");
      else if (typeParam === "other") setType("other");
      else setType(typeParam);
    }
    if (statusParam) setStatus(statusParam);
    if (orderParam) setSort(orderParam);
    if (tagParam) setSelectedTags([tagParam]);
    if (yearParam) setYearRange(yearParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL query parameters
  const updateUrlParams = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    if (debouncedQuery.trim()) url.searchParams.set("q", debouncedQuery.trim());
    else url.searchParams.delete("q");

    if (type) {
      const typeSlug =
        type === "ja"
          ? "manga"
          : type === "ko"
          ? "manhwa"
          : type === "zh"
          ? "manhua"
          : type;
      url.searchParams.set("type", typeSlug);
    } else {
      url.searchParams.delete("type");
    }

    if (status) url.searchParams.set("status", status);
    else url.searchParams.delete("status");

    if (sort && sort !== "followedCount") url.searchParams.set("order", sort);
    else url.searchParams.delete("order");

    if (yearRange && yearRange !== "all") url.searchParams.set("year", yearRange);
    else url.searchParams.delete("year");

    if (selectedTags.length) url.searchParams.set("tag", selectedTags[0]);
    else url.searchParams.delete("tag");

    window.history.replaceState(null, "", url.toString());
  }, [debouncedQuery, type, status, sort, yearRange, selectedTags]);

  // Helper to map type to MangaDex originalLanguage array
  const getTypeParam = useCallback((selectedType: string): string[] | undefined => {
    if (!selectedType) return undefined;
    if (selectedType === "ja") return ["ja"];
    if (selectedType === "ko") return ["ko"];
    if (selectedType === "zh") return ["zh", "zh-ro"];
    if (selectedType === "other") {
      return ["en", "fr", "es", "id", "vi", "th", "ru", "pt-br"];
    }
    return [selectedType];
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setManga([]);
    setOffset(0);
    setHasMore(true);

    const effectiveOrder = debouncedQuery.trim() && sort === "followedCount" ? "relevance" : sort;

    try {
      const res = await searchManga({
        query: debouncedQuery.trim() || undefined,
        includedTags: selectedTags.length ? selectedTags : undefined,
        status: status ? [status as any] : undefined,
        type: getTypeParam(type),
        order: effectiveOrder as any,
        year: parseYearRange(yearRange),
        limit: PAGE_SIZE,
        offset: 0,
      });
      setManga(filterResults(res.data));
      setTotal(res.total);
      setHasMore(res.data.length === PAGE_SIZE);
      setOffset(PAGE_SIZE);
    } catch {
      setManga([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedTags, status, type, sort, yearRange, getTypeParam, filterResults]);

  // Trigger search on query or filter changes
  useEffect(() => {
    loadInitial();
    updateUrlParams();
  }, [loadInitial, updateUrlParams]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const effectiveOrder = debouncedQuery.trim() && sort === "followedCount" ? "relevance" : sort;

    try {
      const res = await searchManga({
        query: debouncedQuery.trim() || undefined,
        includedTags: selectedTags.length ? selectedTags : undefined,
        status: status ? [status as any] : undefined,
        type: getTypeParam(type),
        order: effectiveOrder as any,
        year: parseYearRange(yearRange),
        limit: PAGE_SIZE,
        offset,
      });
      setManga((prev) => [...prev, ...filterResults(res.data)]);
      setHasMore(res.data.length === PAGE_SIZE);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset, debouncedQuery, selectedTags, status, type, sort, yearRange, getTypeParam, filterResults]);

  // Infinite scroll observer
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const clearAdvancedFilters = () => {
    setSelectedTags([]);
    setStatus("");
    setYearRange("all");
    setSort("followedCount");
  };

  const clearAll = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setType("");
    clearAdvancedFilters();
  };

  // Group tags and filter by tagSearchQuery
  const groupedTags = useMemo(() => {
    const map: Record<string, Tag[]> = {};
    const q = tagSearchQuery.toLowerCase().trim();

    tags.forEach((tag) => {
      if (q && !tag.name.toLowerCase().includes(q)) return;
      // Hentai-related tags only surface while the Pornographic (18+) filter is
      // active — otherwise they never appear in the browse sidebar.
      if (!isAdultMode && isAdultTagName(tag.name)) return;
      if (!map[tag.group]) map[tag.group] = [];
      map[tag.group].push(tag);
    });

    if (isAdultMode) {
      Object.keys(map).forEach((group) => {
        map[group].sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aIdx = ADULT_PRIORITY_TAGS.findIndex((t) => aName.includes(t));
          const bIdx = ADULT_PRIORITY_TAGS.findIndex((t) => bName.includes(t));
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
          if (aIdx !== -1) return -1;
          if (bIdx !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
      });
    }

    return map;
  }, [tags, tagSearchQuery, isAdultMode]);

  // Demographic tags (Shounen, Shoujo, Seinen, Josei)
  const demographicTags = useMemo(() => {
    const targets = ["shounen", "shoujo", "seinen", "josei"];
    return tags.filter((t) => targets.includes(t.name.toLowerCase()));
  }, [tags]);

  const sortOptions = [
    { value: "followedCount", label: "Most Popular" },
    { value: "rating", label: "Highest Rating" },
    { value: "relevance", label: "Best Match / Relevance" },
    { value: "latestUploadedChapter", label: "Latest Update" },
    { value: "createdAt", label: "Recently Added" },
    { value: "title", label: "Title A-Z" },
  ];

  const activeAdvancedFiltersCount =
    selectedTags.length +
    (status ? 1 : 0) +
    (yearRange !== "all" ? 1 : 0) +
    (sort !== "followedCount" ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 1. Header: Clean Title without count, Search Bar, Format Dropdown, and Advanced Filters Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Browse <span className="gradient-text">Comics &amp; Manga</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comics..."
              autoComplete="off"
              data-1p-ignore="true"
              data-lpignore="true"
              suppressHydrationWarning
              className="w-full rounded-xl bg-zinc-900/90 border border-white/10 pl-10 pr-9 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent-primary/60 transition-all shadow-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Type Dropdown: All, Manga, Manhwa, Manhua, Other */}
          <div className="relative shrink-0">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="appearance-none rounded-xl bg-zinc-900 border border-white/10 pl-4 pr-10 py-2 text-sm font-medium text-white focus:outline-none focus:border-accent-primary/60 transition-all cursor-pointer shadow-md hover:border-zinc-700"
            >
              <option value="">All</option>
              <option value="ja">Manga</option>
              <option value="ko">Manhwa</option>
              <option value="zh">Manhua</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>

          {/* Advanced Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all cursor-pointer ${
              showFilters || activeAdvancedFiltersCount > 0
                ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/25 font-semibold"
                : "bg-zinc-900 border-white/10 text-zinc-300 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeAdvancedFiltersCount > 0 && (
              <span className="text-xs rounded-full w-5 h-5 flex items-center justify-center bg-black/40 text-white font-bold font-mono">
                {activeAdvancedFiltersCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle (Grid vs List) */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900/80 border border-white/5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Compact List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Advanced Filters Bar */}
      {activeAdvancedFiltersCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3 shadow-inner">
          <span className="text-xs font-mono text-zinc-500 mr-1">Active:</span>

          {status && (
            <button
              type="button"
              onClick={() => setStatus("")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 transition-all capitalize"
            >
              <span>{status}</span>
              <X className="h-3 w-3" />
            </button>
          )}

          {sort !== "followedCount" && (
            <button
              type="button"
              onClick={() => setSort("followedCount")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 transition-all"
            >
              <span>Sort: {sortOptions.find((o) => o.value === sort)?.label}</span>
              <X className="h-3 w-3" />
            </button>
          )}

          {yearRange !== "all" && (
            <button
              type="button"
              onClick={() => setYearRange("all")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 transition-all"
            >
              <span>Year: {yearRange}</span>
              <X className="h-3 w-3" />
            </button>
          )}

          {tags
            .filter((t) => selectedTags.includes(t.id))
            .map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-primary/20 border border-accent-primary/40 px-2.5 py-1 text-xs text-white hover:bg-accent-primary/30 transition-all"
              >
                <span>{tag.name}</span>
                <X className="h-3 w-3" />
              </button>
            ))}

          <button
            type="button"
            onClick={clearAdvancedFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#FF453A] hover:underline ml-auto pl-2"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        </div>
      )}

      {/* 3. Collapsible Advanced Filters Drawer */}
      {showFilters && (
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-[#0e0e12] p-6 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Sort Order Section */}
            <div>
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 block">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-accent-primary/50 transition-all cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Status Section */}
            <div>
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 block">
                Publication Status
              </label>
              <div className="flex flex-wrap gap-2">
                {["ongoing", "completed", "hiatus", "cancelled"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(status === s ? "" : s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      status === s
                        ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20 font-semibold"
                        : "bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Release Era Section */}
            <div>
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 block">
                Release Era
              </label>
              <div className="flex flex-wrap gap-2">
                {YEAR_PRESETS.map((y) => (
                  <button
                    key={y.value}
                    type="button"
                    onClick={() => setYearRange(y.value)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      yearRange === y.value
                        ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20 font-semibold"
                        : "bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    {y.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics Quick Row */}
          {demographicTags.length > 0 && (
            <div className="mb-6 pt-4 border-t border-zinc-800/80">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 block">
                Target Demographics
              </label>
              <div className="flex flex-wrap gap-2">
                {demographicTags.map((dt) => {
                  const isSelected = selectedTags.includes(dt.id);
                  return (
                    <button
                      key={dt.id}
                      type="button"
                      onClick={() => toggleTag(dt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                          : "bg-zinc-900/80 border-white/10 text-zinc-300 hover:text-white hover:border-zinc-600"
                      }`}
                    >
                      {dt.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags Section with Tag Search Input */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                Genres &amp; Themes
              </label>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  placeholder="Find tags (e.g. Action, Isekai)..."
                  className="w-full rounded-xl bg-zinc-900 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent-primary/60"
                />
              </div>
            </div>

            {Object.entries(groupedTags).map(([group, groupTags]) => {
              if (groupTags.length === 0) return null;
              return (
                <div key={group} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-300">
                      {TAG_GROUPS[group] || group}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      ({groupTags.length})
                    </span>
                    <div className="h-px flex-1 bg-zinc-800" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {groupTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/30 font-semibold"
                              : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white hover:border-zinc-700"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={clearAdvancedFilters}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-[#c92a17] text-white text-xs font-semibold font-mono shadow-md transition-all cursor-pointer"
            >
              Apply &amp; Close
            </button>
          </div>
        </div>
      )}

      {/* 4. Results (Grid or List View) */}
      {loading ? (
        <LoadingGrid />
      ) : manga.length > 0 ? (
        viewMode === "grid" ? (
          <MangaGrid manga={manga} />
        ) : (
          <div className="space-y-3">
            {manga.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 rounded-2xl border border-white/5 bg-[#0c0c0e] hover:bg-[#131317] hover:border-zinc-700/60 transition-all group"
              >
                <Link
                  href={`/manga/${item.id}`}
                  className="relative h-28 w-20 shrink-0 rounded-xl overflow-hidden shadow-md bg-zinc-900"
                >
                  {item.coverUrl ? (
                    <Image
                      src={toHighResCoverUrl(item.coverUrl) || item.coverUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-600">
                      <BookOpen className="h-6 w-6" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link
                      href={`/manga/${item.id}`}
                      className="text-sm sm:text-base font-bold text-white group-hover:text-[#FF453A] transition-colors truncate"
                    >
                      {item.title}
                    </Link>
                    {item.type && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 uppercase">
                        {item.type}
                      </span>
                    )}
                    {item.status && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                        {item.status}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(item.tags || []).slice(0, 5).map((t) => (
                      <span
                        key={t.id}
                        onClick={() => toggleTag(t.id)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating ? item.rating.toFixed(1) : "N/A"}</span>
                  </div>
                  {item.followingCount > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                      <Users className="h-3 w-3" />
                      <span>{item.followingCount.toLocaleString()}</span>
                    </div>
                  )}
                  {item.year && (
                    <span className="text-[11px] font-mono text-zinc-500">
                      {item.year}
                    </span>
                  )}
                  <Link
                    href={`/manga/${item.id}`}
                    className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#DF301C] text-xs font-mono font-semibold text-white transition-colors"
                  >
                    Read
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-base font-bold text-white mb-1">No titles found</p>
          <p className="text-xs text-zinc-400 mb-4 max-w-sm mx-auto">
            We couldn&apos;t find any titles matching your search and filter criteria.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-mono text-white transition-colors cursor-pointer"
          >
            Clear All Filters &amp; Search
          </button>
        </div>
      )}

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="py-8 flex justify-center">
        {loadingMore && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
            <Loader2 className="h-4 w-4 animate-spin text-[#DF301C]" />
            Loading more titles...
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-2xl bg-zinc-900/80 mb-3" />
          <div className="h-4 bg-zinc-900/80 rounded-lg mb-2 w-3/4" />
          <div className="h-3 bg-zinc-900/80 rounded-lg w-1/2" />
        </div>
      ))}
    </div>
  );
}
