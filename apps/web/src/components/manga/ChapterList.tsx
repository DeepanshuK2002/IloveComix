"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Chapter, SearchResult } from "@/lib/types";
import {
  Search,
  Users,
  Globe,
  ArrowDown,
  ArrowUp,
  ThumbsUp,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check,
  BookOpen,
  Star,
} from "lucide-react";
import { isComicSaved, toggleSaveComic } from "@/lib/bookmarks";
import { CONTENT_LANGUAGES } from "@/lib/settings";

interface ChapterListProps {
  mangaId: string;
  mangaTitle?: string;
  altTitles?: string[];
  chapters: Chapter[];
  recommendations?: SearchResult[];
  /** Languages this comic actually has chapters in (from the server) */
  availableLanguages?: string[];
  /** Default language filter, e.g. the user's primary language when available */
  initialLanguage?: string;
  /** Content is adult → scanlator/aggregator copies sort before MangaDex on ties */
  adult?: boolean;
  /** Show fallback banner when the requested primary language has no chapters */
  showingLanguageFallback?: boolean;
}

function getRelativeTime(dateStr: string): string {
  if (!dateStr) return "recently";
  try {
    const now = Date.now();
    const time = new Date(dateStr).getTime();
    const diffSec = Math.max(0, Math.floor((now - time) / 1000));

    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) return `${diffWeeks}w ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mos ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
  } catch {
    return "recently";
  }
}

export function ChapterList({
  mangaId,
  chapters,
  recommendations = [],
  availableLanguages = [],
  initialLanguage = "en",
  adult = false,
  showingLanguageFallback = false,
}: ChapterListProps) {
  const [chapterList, setChapterList] = useState<Chapter[]>(chapters);

  // Synchronize when parent chapters prop changes
  useEffect(() => {
    setChapterList(chapters);
  }, [chapters]);

  const [searchQuery, setSearchQuery] = useState("");
  const [langFilter, setLangFilter] = useState<string>(initialLanguage || "en");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState<"chapter" | "volume" | "date">("chapter");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [recPage, setRecPage] = useState(0);
  const [recVotes, setRecVotes] = useState<Record<string, number>>({});
  const [bookmarkedChapters, setBookmarkedChapters] = useState<Record<string, boolean>>({});

  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Keep the language filter in sync if the server passes a new default
  useEffect(() => {
    if (initialLanguage) setLangFilter(initialLanguage);
  }, [initialLanguage]);

  // Close group dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(e.target as Node)
      ) {
        setIsGroupDropdownOpen(false);
      }
    };
    if (isGroupDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isGroupDropdownOpen]);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setIsLangDropdownOpen(false);
      }
    };
    if (isLangDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLangDropdownOpen]);

  // Human-readable label for a language code ("en" → "English", unknown → "EN")
  const languageLabel = (code: string): string => {
    const known = CONTENT_LANGUAGES.find((l) => l.code === code);
    return known ? known.label : code.toUpperCase();
  };

  // Languages present in the current chapter list (server list ∪ whatever the
  // background aggregation adds later), ordered per the app's language order.
  const languages = useMemo(() => {
    const set = new Set<string>();
    (availableLanguages.length > 0 ? availableLanguages : ["en"]).forEach((l) =>
      set.add(l)
    );
    chapterList.forEach((ch) => {
      const lang = ch.translatedLanguage || "en";
      if (lang) set.add(lang);
    });
    const order: string[] = CONTENT_LANGUAGES.map((l) => l.code);
    return Array.from(set).sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [chapterList, availableLanguages]);

  // Extract scanlation groups
  const groups = useMemo(() => {
    const set = new Set<string>();
    chapterList.forEach((ch) => {
      if (ch.scanlationGroup) set.add(ch.scanlationGroup);
      else set.add("Unknown group");
    });
    return Array.from(set).sort();
  }, [chapterList]);

  // Filter and sort chapters
  const filteredChapters = useMemo(() => {
    let result = [...chapterList];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ch) =>
          (ch.chapter && ch.chapter.toLowerCase().includes(q)) ||
          (ch.title && ch.title.toLowerCase().includes(q)) ||
          (ch.volume && ch.volume.toLowerCase().includes(q)) ||
          (ch.scanlationGroup && ch.scanlationGroup.toLowerCase().includes(q)) ||
          (ch.sourceName && ch.sourceName.toLowerCase().includes(q))
      );
    }

    // Chapter language filter (only when this comic has more than one language)
    if (langFilter !== "all" && languages.length > 0) {
      result = result.filter(
        (ch) => (ch.translatedLanguage || "en") === langFilter
      );
    }

    // Scanlation group filter
    if (selectedGroup !== "all") {
      result = result.filter((ch) => {
        const g = ch.scanlationGroup || "Unknown group";
        return g === selectedGroup;
      });
    }

    // Sort order
    result.sort((a, b) => {
      if (sortField === "chapter") {
        const numA = parseFloat(a.chapter || "0");
        const numB = parseFloat(b.chapter || "0");
        if (numA !== numB) {
          return sortDirection === "desc" ? numB - numA : numA - numB;
        }
        // If chapter numbers are identical (e.g. Ch. 2 MangaDex, Ch. 2 Asura, Ch. 2 Desire),
        // list them consecutively sorted deterministically by source name.
        // For adult titles, external scanlator/aggregator copies come first.
        if (adult) {
          const aExternal = (a.source || "mangadex") !== "mangadex" ? 0 : 1;
          const bExternal = (b.source || "mangadex") !== "mangadex" ? 0 : 1;
          if (aExternal !== bExternal) return aExternal - bExternal;
        }
        return (a.sourceName || a.source || "").localeCompare(
          b.sourceName || b.source || ""
        );
      } else if (sortField === "volume") {
        const volA = parseFloat(a.volume || "0");
        const volB = parseFloat(b.volume || "0");
        if (volA !== volB) {
          return sortDirection === "desc" ? volB - volA : volA - volB;
        }
        if (adult) {
          const aExternal = (a.source || "mangadex") !== "mangadex" ? 0 : 1;
          const bExternal = (b.source || "mangadex") !== "mangadex" ? 0 : 1;
          if (aExternal !== bExternal) return aExternal - bExternal;
        }
        return (a.sourceName || a.source || "").localeCompare(
          b.sourceName || b.source || ""
        );
      } else {
        const dateA = new Date(a.publishAt).getTime() || 0;
        const dateB = new Date(b.publishAt).getTime() || 0;
        return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
      }
    });

    return result;
  }, [
    chapterList,
    searchQuery,
    langFilter,
    languages,
    selectedGroup,
    sortField,
    sortDirection,
    adult,
  ]);

  // Handle Sort button clicks
  const handleSortClick = (field: "chapter" | "volume" | "date") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Toggle chapter bookmark
  const toggleBookmark = (chId: string) => {
    setBookmarkedChapters((prev) => ({
      ...prev,
      [chId]: !prev[chId],
    }));
  };

  // Recommendation upvote / downvote
  const handleVote = (id: string, delta: number) => {
    setRecVotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + delta,
    }));
  };

  // Recommendation saved state in local library
  const [savedRecMap, setSavedRecMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateSavedMap = () => {
      const map: Record<string, boolean> = {};
      recommendations.forEach((r) => {
        map[r.id] = isComicSaved(r.id);
      });
      setSavedRecMap(map);
    };

    updateSavedMap();
    window.addEventListener("ilovecomix-bookmarks-changed", updateSavedMap);
    window.addEventListener("storage", updateSavedMap);
    return () => {
      window.removeEventListener("ilovecomix-bookmarks-changed", updateSavedMap);
      window.removeEventListener("storage", updateSavedMap);
    };
  }, [recommendations]);

  const handleToggleSaveRec = (rec: SearchResult) => {
    const next = toggleSaveComic({
      id: rec.id,
      title: rec.title,
      coverUrl: rec.coverUrl,
      type: rec.type,
      rating: rec.rating,
    });
    setSavedRecMap((prev) => ({ ...prev, [rec.id]: next }));
  };

  // Map each recommendation to its overall ranking in its category
  const categoryRankMap = useMemo(() => {
    const map: Record<string, number> = {};
    const catCounters: Record<string, number> = {};

    recommendations.forEach((rec) => {
      if (rec.rank) {
        map[rec.id] = rec.rank;
      } else {
        const cat = (rec.type || "manga").toLowerCase();
        catCounters[cat] = (catCounters[cat] || 0) + 1;
        map[rec.id] = catCounters[cat];
      }
    });

    return map;
  }, [recommendations]);

  // Paginated recommendations (5 per page)
  const recItemsPerPage = 5;
  const maxRecPage = Math.max(
    0,
    Math.ceil(recommendations.length / recItemsPerPage) - 1
  );
  const visibleRecommendations = recommendations.slice(
    recPage * recItemsPerPage,
    (recPage + 1) * recItemsPerPage
  );

  return (
    <>
      {showingLanguageFallback && (
        <div className="mb-5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          No chapters in the requested language are available for this comic.
          Showing English chapters instead.
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      {/* ================= LEFT / MAIN: Chapters List (lg:col-span-8 or 9) ================= */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-4">
        {/* Sources Pill Bar */}
        <div className="flex items-center justify-end gap-2.5 pb-1">
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Chapter Input */}
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapter..."
              autoComplete="off"
              data-1p-ignore="true"
              data-lpignore="true"
              suppressHydrationWarning
              className="w-full rounded-xl border border-zinc-800 bg-[#0e0e12] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Right Controls: Language / Group Dropdowns & Sort Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Chapter Language Dropdown (only when this comic has chapters in >1 language) */}
            {languages.length > 1 && (
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#0e0e12] px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  aria-expanded={isLangDropdownOpen}
                  title="Chapter language"
                >
                  <Globe className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate max-w-[130px]">
                    {langFilter === "all"
                      ? "All languages"
                      : languageLabel(langFilter)}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-zinc-400 shrink-0 transition-transform ${
                      isLangDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Language Dropdown Menu */}
                {isLangDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 z-30 w-52 rounded-2xl border border-zinc-800 bg-[#0e0e12] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setLangFilter("all");
                        setIsLangDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                        langFilter === "all"
                          ? "bg-zinc-800 text-white font-semibold"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      <span>All languages</span>
                      {langFilter === "all" && (
                        <Check className="h-3.5 w-3.5 text-white" />
                      )}
                    </button>

                    <div className="my-1 border-t border-zinc-800/80" />

                    {languages.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setLangFilter(code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                          langFilter === code
                            ? "bg-zinc-800 text-white font-semibold"
                            : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{languageLabel(code)}</span>
                        {langFilter === code && (
                          <Check className="h-3.5 w-3.5 text-white shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Scanlation Group Dropdown */}
            <div className="relative" ref={groupDropdownRef}>
              <button
                type="button"
                onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#0e0e12] px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                aria-expanded={isGroupDropdownOpen}
              >
                <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span className="truncate max-w-[130px]">
                  {selectedGroup === "all" ? "All groups" : selectedGroup}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-zinc-400 shrink-0 transition-transform ${
                    isGroupDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Group Dropdown Menu */}
              {isGroupDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 z-30 w-56 rounded-2xl border border-zinc-800 bg-[#0e0e12] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroup("all");
                      setIsGroupDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                      selectedGroup === "all"
                        ? "bg-zinc-800 text-white font-semibold"
                        : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <span>All groups</span>
                    {selectedGroup === "all" && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>

                  <div className="my-1 border-t border-zinc-800/80" />

                  {groups.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => {
                        setSelectedGroup(group);
                        setIsGroupDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                        selectedGroup === group
                          ? "bg-zinc-800 text-white font-semibold"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{group}</span>
                      {selectedGroup === group && (
                        <Check className="h-3.5 w-3.5 text-white shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Buttons Segment */}
            <div className="inline-flex items-center rounded-xl border border-zinc-800 bg-[#0e0e12] p-1 text-xs">
              <button
                type="button"
                onClick={() => handleSortClick("chapter")}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  sortField === "chapter"
                    ? "bg-zinc-800 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{sortDirection === "desc" ? "↓" : "↑"}</span>
                <span>Chapter</span>
              </button>
              <button
                type="button"
                onClick={() => handleSortClick("volume")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  sortField === "volume"
                    ? "bg-zinc-800 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Volume
              </button>
              <button
                type="button"
                onClick={() => handleSortClick("date")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  sortField === "date"
                    ? "bg-zinc-800 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Date
              </button>
            </div>
          </div>
        </div>



        {/* Chapters Table List */}
        {filteredChapters.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8">
            <BookOpen className="h-6 w-6 text-zinc-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">No chapters found</p>
            <p className="text-xs text-zinc-500 mt-1">
              Try adjusting your search query, group filter, or selected source.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] overflow-hidden">
            {filteredChapters.map((chapter) => {
              const chapterNum = chapter.chapter ? `Ch.${chapter.chapter}` : "Ch.-";
              const volumeText = chapter.volume ? `Vol.${chapter.volume}` : null;
              const titleText =
                chapter.title ||
                (chapter.chapter ? `Chapter ${chapter.chapter}` : "Chapter");
              const isBookmarked = bookmarkedChapters[chapter.id];

              return (
                <div
                  key={chapter.id}
                  className="group flex items-center justify-between px-4 py-3 hover:bg-zinc-900/60 transition-colors"
                >
                  {/* Left: Chapter Number, Volume, Title, and Source Badge */}
                  <Link
                    href={
                      chapter.readUrl ||
                      chapter.externalHref ||
                      `/read/${mangaId}/${chapter.id}`
                    }
                    className="flex items-center gap-2.5 min-w-0 flex-1 mr-4"
                  >
                    {/* Chapter Number */}
                    <span className="text-sm font-bold text-[#FF453A] group-hover:text-[#ff6e65] shrink-0 font-mono">
                      {chapterNum}
                    </span>

                    {/* Volume if available */}
                    {volumeText && (
                      <span className="text-xs font-mono text-zinc-400 shrink-0">
                        {volumeText}
                      </span>
                    )}

                    {/* Chapter Title */}
                    <span className="text-xs sm:text-sm text-zinc-300 group-hover:text-white font-medium truncate transition-colors">
                      {titleText}
                    </span>
                  </Link>

                  {/* Right: Source, Likes, Relative Date & Bookmark Icon */}
                  <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-zinc-400 shrink-0 font-mono">
                    {(() => {
                      const src = chapter.source || "mangadex";
                      const label =
                        chapter.sourceName ||
                        (src === "mangadex" ? "MangaDex" : src);
                      return (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#FF453A]">
                          <span className="h-1 w-1 rounded-full bg-[#FF453A]" />
                          {label}
                        </span>
                      );
                    })()}

                    <span className="text-zinc-600">&bull;</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <ThumbsUp className="h-3 w-3 text-zinc-400" />
                      <span>0</span>
                    </span>

                    <span className="text-zinc-600">&bull;</span>
                    <span className="text-zinc-400 whitespace-nowrap">
                      {getRelativeTime(chapter.publishAt)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(chapter.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-[#FF453A] transition-colors"
                      title="Bookmark chapter"
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 transition-colors ${
                          isBookmarked
                            ? "fill-[#FF453A] text-[#FF453A]"
                            : "text-zinc-500"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= RIGHT SIDEBAR: Recommendations (lg:col-span-4 or 3) ================= */}
      {recommendations.length > 0 && (
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Recommendations Header with Carousel Controls */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <h3 className="text-base font-bold text-white tracking-tight">
              Recommendations
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRecPage((p) => Math.max(0, p - 1))}
                disabled={recPage === 0}
                className="h-6 w-6 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 transition-colors"
                aria-label="Previous recommendations"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRecPage((p) => Math.min(maxRecPage, p + 1))}
                disabled={recPage >= maxRecPage}
                className="h-6 w-6 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 transition-colors"
                aria-label="Next recommendations"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Recommendations List (matching screenshot layout with Type, Category Rank & Inline Save) */}
          <div className="space-y-2.5">
            {visibleRecommendations.map((rec, index) => {
              const currentScore =
                recVotes[rec.id] !== undefined
                  ? recVotes[rec.id]
                  : Math.max(0, 3 - index);
              
              // Overall category ranking
              const categoryRank = rec.rank || categoryRankMap[rec.id] || 1;
              const isSaved = Boolean(savedRecMap[rec.id]);
              const recType = rec.type ? rec.type.toUpperCase() : "MANGA";

              return (
                <div
                  key={rec.id}
                  className="flex items-start justify-between gap-2.5 group rounded-xl p-2.5 hover:bg-zinc-900/60 border border-transparent hover:border-zinc-800/80 transition-all"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Cover Thumbnail */}
                    <Link
                      href={`/manga/${rec.id}`}
                      className="relative aspect-[3/4] w-16 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 block"
                    >
                      {rec.coverUrl ? (
                        <Image
                          src={rec.coverUrl}
                          alt={rec.title}
                          fill
                          sizes="70px"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] font-mono text-zinc-600">
                          No Cover
                        </div>
                      )}
                    </Link>

                    {/* Title, Badges & Inline Save */}
                    <div className="min-w-0 pt-0.5 space-y-1.5 flex-1">
                      <Link href={`/manga/${rec.id}`} className="block">
                        <p className="text-xs font-semibold text-zinc-200 group-hover:text-[#FF453A] line-clamp-2 leading-snug transition-colors">
                          {rec.title}
                        </p>
                      </Link>

                      {/* Badges: Type, Category Rank, Inline Save, Rating */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Type Badge (Manga, Manhwa, Manhua) */}
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                            recType === "MANHWA"
                              ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                              : recType === "MANHUA"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-purple-500/30 bg-purple-500/10 text-purple-400"
                          }`}
                        >
                          {recType}
                        </span>

                        {/* Save Button: Inline with ranking, WITHOUT border and WITHOUT background */}
                        <button
                          type="button"
                          onClick={() => handleToggleSaveRec(rec)}
                          className={`inline-flex items-center justify-center p-0.5 transition-colors focus:outline-none cursor-pointer ${
                            isSaved
                              ? "text-emerald-400 hover:text-emerald-300"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                          title={isSaved ? "Saved in library" : "Save comic to library"}
                          aria-label={`Save ${rec.title}`}
                        >
                          <Bookmark
                            className={`h-3.5 w-3.5 transition-all ${
                              isSaved ? "fill-emerald-400 text-emerald-400 scale-110" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </button>

                        {rec.rating > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-400">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            {rec.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Upvote/Downvote Widget */}
                  <div className="flex flex-col items-center justify-center gap-0 text-zinc-400 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleVote(rec.id, 1)}
                      className="p-0.5 hover:text-white transition-colors"
                      aria-label={`Upvote ${rec.title}`}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-zinc-300">
                      {currentScore}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVote(rec.id, -1)}
                      className="p-0.5 hover:text-white transition-colors"
                      aria-label={`Downvote ${rec.title}`}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
