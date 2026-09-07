"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/lib/types";
import { useSavedComicStatus } from "@/lib/bookmarks";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Play,
  Info,
  Loader2,
  Bookmark,
} from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const CATEGORIES = [
  { label: "All Categories", value: "all" },
  { label: "Japanese Manga", value: "manga" },
  { label: "Korean Manhwa", value: "manhwa" },
  { label: "Chinese Manhua", value: "manhua" },
];

const POPULAR_SEARCHES = [
  "Solo Leveling",
  "One Piece",
  "Chainsaw Man",
  "Jujutsu Kaisen",
  "Berserk",
  "Omniscient Reader",
];

// Single Result Card Item with instant Save & Read buttons visible even when collapsed
function SearchResultItem({
  item,
  query,
  isExpanded,
  onToggleExpand,
  onSelectManga,
  onClose,
}: {
  item: SearchResult;
  query?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectManga: (id: string) => void;
  onClose: () => void;
}) {
  const { isSaved, toggle } = useSavedComicStatus(item.id);

  const formattedType =
    item.type === "manga"
      ? "Manga"
      : item.type === "manhwa"
      ? "Manhwa"
      : item.type === "manhua"
      ? "Manhua"
      : "Comic";
  const displayYear =
    item.year || (item.status === "ongoing" ? "Ongoing" : "Completed");
  const genreString = item.tags.slice(0, 2).map((t) => t.name).join(", ");
  const ratingString = item.rating > 0 ? item.rating.toFixed(1) : "8.5";

  // Check if an alt title matched the search query or should be shown as subtitle
  const matchedAlt = item.altTitles?.find(
    (alt) =>
      query &&
      alt.toLowerCase().includes(query.toLowerCase()) &&
      alt.toLowerCase() !== item.title.toLowerCase()
  );
  const subtitleAlt = matchedAlt || (item.altTitles?.[0] !== item.title ? item.altTitles?.[0] : null);

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-[#121216] p-3.5 sm:p-4 transition-all hover:border-zinc-700/90">
      {/* Top Row: Thumbnail + Info + Expand Toggle */}
      <div className="flex items-start gap-3.5">
        {/* Poster Thumbnail */}
        <button
          type="button"
          onClick={() => onSelectManga(item.id)}
          className="relative h-24 w-16 sm:h-28 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800/80 text-left focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none group"
        >
          {item.coverUrl ? (
            <Image
              src={item.coverUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 64px, 80px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] font-mono text-zinc-500">
              N/A
            </div>
          )}
        </button>

        {/* Info & Action Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Manga Title (Always English by default) */}
              <h3
                onClick={() => onSelectManga(item.id)}
                className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug line-clamp-1 cursor-pointer hover:text-zinc-200 transition-colors"
                title={item.title}
              >
                {item.title}
              </h3>

              {/* Matched Alt / Original Name Subtitle */}
              {subtitleAlt && (
                <p
                  className="text-[11px] text-zinc-400/90 font-mono truncate mt-0.5"
                  title={subtitleAlt}
                >
                  <span className="text-zinc-600">AKA: </span>
                  {subtitleAlt}
                </p>
              )}

              {/* Metadata Row: Type | Year | ★ Rating | Genres */}
              <div className="mt-1 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-zinc-400 flex-wrap font-mono">
                <span>{formattedType}</span>
                <span className="text-zinc-600">|</span>
                <span>{displayYear}</span>
                <span className="text-zinc-600">|</span>
                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {ratingString}
                </span>
                {genreString && (
                  <>
                    <span className="text-zinc-600">|</span>
                    <span className="truncate max-w-[140px] text-zinc-400">
                      {genreString}
                    </span>
                  </>
                )}
              </div>

              {/* ACTION BUTTONS: Read Button & Save Icon (ALWAYS VISIBLE - EVEN COLLAPSED) */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {/* Read Now Button */}
                <Link
                  href={`/manga/${item.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                >
                  <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                  Read
                </Link>

                {/* Save to Library / Bookmark Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle({
                      id: item.id,
                      title: item.title,
                      coverUrl: item.coverUrl,
                      type: item.type,
                      year: item.year,
                      rating: item.rating,
                      status: item.status,
                      tags: item.tags,
                    });
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none active:scale-95 ${
                    isSaved
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-semibold shadow-sm"
                      : "border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800"
                  }`}
                  title={isSaved ? "Saved to Bookmarks (Click to remove)" : "Save to Bookmarks"}
                  aria-label={isSaved ? `Remove ${item.title} from bookmarks` : `Save ${item.title} to bookmarks`}
                >
                  <Bookmark
                    className={`h-3.5 w-3.5 transition-colors ${
                      isSaved ? "fill-emerald-400 text-emerald-400" : "text-zinc-400"
                    }`}
                    aria-hidden="true"
                  />
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>

            {/* Expand / Collapse Chevron Button */}
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content (Synopsis + More Details) */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-zinc-800/60 animate-in fade-in duration-150">
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2 mb-3">
            {item.description ||
              "Discover this title and read all chapters for free on Ilovecomix."}
          </p>

          <div className="flex items-center gap-2">
            <Link
              href={`/manga/${item.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/90 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              See more details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchModal({ isOpen, onClose, initialQuery = "" }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Focus input and lock body scroll on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
      if (initialQuery) {
        setQuery(initialQuery);
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialQuery]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCategoryOpen) {
          setIsCategoryOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCategoryOpen, onClose]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };
    if (isCategoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCategoryOpen]);

  // Debounced live search
  const performSearch = useCallback(async (q: string, cat: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (cat !== "all") params.set("type", cat);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const data: SearchResult[] = json.data || [];
        setResults(data);
        if (data.length > 0) {
          // Auto-expand the first result like in the screenshot
          setExpandedId(data[0].id);
        } else {
          setExpandedId(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch search results:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      performSearch(query, category);
    }, 280);

    return () => clearTimeout(timer);
  }, [query, category, isOpen, performSearch]);

  if (!isOpen) return null;

  const currentCategoryLabel =
    CATEGORIES.find((c) => c.value === category)?.label || "All Categories";

  const handleSelectManga = (mangaId: string) => {
    onClose();
    router.push(`/manga/${mangaId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="relative w-full max-w-xl sm:max-w-2xl rounded-2xl border border-zinc-800/90 bg-[#0c0c0e] shadow-2xl p-5 sm:p-6 space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Search
          </h2>

          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                aria-expanded={isCategoryOpen}
                aria-haspopup="listbox"
              >
                <span>{currentCategoryLabel}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isCategoryOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 z-20 w-44 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150"
                  role="listbox"
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setCategory(cat.value);
                        setIsCategoryOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                        category === cat.value
                          ? "bg-zinc-800 text-white font-semibold"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                      }`}
                      role="option"
                      aria-selected={category === cat.value}
                    >
                      <span>{cat.label}</span>
                      {category === cat.value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
              aria-label="Close search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center rounded-xl border border-zinc-800/90 bg-zinc-950 px-4 py-3 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-400 transition-all">
          <Search className="h-4 w-4 text-zinc-400 shrink-0 mr-3" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or genre…"
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            spellCheck={false}
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            suppressHydrationWarning
          />

          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" aria-hidden="true" />
            )}
            {query.length > 0 && !loading && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="rounded-full p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                aria-label="Clear search query"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Results / Suggestion List */}
        <div className="max-h-[55vh] overflow-y-auto space-y-3.5 pr-1 -mr-1">
          {/* If there are results */}
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((item) => (
                <SearchResultItem
                  key={item.id}
                  item={item}
                  query={query}
                  isExpanded={expandedId === item.id}
                  onToggleExpand={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                  onSelectManga={handleSelectManga}
                  onClose={onClose}
                />
              ))}
            </div>
          )}

          {/* If search query has results = 0 and not loading */}
          {query.trim().length > 0 && results.length === 0 && !loading && (
            <div className="py-12 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40">
              <p className="text-zinc-300 text-sm font-medium">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                Try searching with different keywords or exploring popular titles.
              </p>
            </div>
          )}

          {/* Empty Query: Quick suggestions */}
          {query.trim().length === 0 && (
            <div className="py-4 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      performSearch(term, category);
                    }}
                    className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
