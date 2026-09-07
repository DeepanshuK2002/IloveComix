"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal, ExternalLink, Compass, RefreshCw } from "lucide-react";
import { HomeFeedRail, type RailItem } from "./HomeFeedRail";
import { getSavedComics } from "@/lib/bookmarks";
import { getReadingHistory } from "@/lib/user";
import type { Chapter, SearchResult } from "@/lib/types";
import { CONTENT_LANGUAGES } from "@/lib/settings";
import { AdultFeed } from "@/components/adult/AdultFeed";

interface HomeFeedClientProps {
  popular: SearchResult[];
  latestChapters: { chapter: Chapter; manga: SearchResult }[];
  newFollows: SearchResult[];
  newSeries: SearchResult[];
  upcomingManhwa: SearchResult[];
  showAdultTrending?: boolean;
}

export function HomeFeedClient({
  popular,
  latestChapters,
  newFollows,
  newSeries,
  upcomingManhwa,
  showAdultTrending = false,
}: HomeFeedClientProps) {
  const [latestTab, setLatestTab] = useState<"Hot" | "New">("Hot");
  const [historyItems, setHistoryItems] = useState<RailItem[]>([]);
  const [followedItems, setFollowedItems] = useState<RailItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdatesMenuOpen, setIsUpdatesMenuOpen] = useState(false);
  const updatesMenuRef = useRef<HTMLDivElement>(null);

  const [popularTime, setPopularTime] = useState("");
  const [newFollowsTime, setNewFollowsTime] = useState("");
  const [latestTypeFilter, setLatestTypeFilter] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [languageFallback, setLanguageFallback] = useState(false);

  const [popularState, setPopularState] = useState<SearchResult[]>(popular);
  const [newFollowsState, setNewFollowsState] = useState<SearchResult[]>(
    newFollows.length > 0 ? newFollows : popular.slice(5, 15)
  );
  const [popularLoading, setPopularLoading] = useState(false);
  const [newFollowsLoading, setNewFollowsLoading] = useState(false);
  const popularBaseRef = useRef(popular);
  const newFollowsBaseRef = useRef<SearchResult[]>(
    newFollows.length > 0 ? newFollows : popular.slice(5, 15)
  );

  const TIME_OPTIONS = [
    { value: "", label: "All time" },
    { value: "today", label: "Today" },
    { value: "7days", label: "Last 7 days" },
    { value: "30days", label: "Last 30 days" },
    { value: "3months", label: "Last 3 months" },
    { value: "6months", label: "Last 6 months" },
    { value: "year", label: "Last year" },
  ];

  const timeLabelOf = (value: string) =>
    TIME_OPTIONS.find((opt) => opt.value === value)?.label ?? "";

  const fetchSection = async (section: "popular" | "newFollows", time: string) => {
    if (section === "popular") {
      setPopularLoading(true);
    } else {
      setNewFollowsLoading(true);
    }
    try {
      if (!time) {
        if (section === "popular") setPopularState(popularBaseRef.current);
        else setNewFollowsState(newFollowsBaseRef.current);
        return;
      }
      const res = await fetch(`/api/home/rails?section=${section}&time=${encodeURIComponent(time)}`);
      const json = await res.json();
      const data: SearchResult[] = Array.isArray(json?.data) ? json.data : [];
      if (section === "popular") setPopularState(data);
      else setNewFollowsState(data);
    } catch {
      // Keep the current items on failure
    } finally {
      if (section === "popular") setPopularLoading(false);
      else setNewFollowsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (updatesMenuRef.current && !updatesMenuRef.current.contains(e.target as Node)) {
        setIsUpdatesMenuOpen(false);
      }
    };
    if (isUpdatesMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUpdatesMenuOpen]);

  // Load reading history (and followed comics) from localStorage if present
  useEffect(() => {
    try {
      const history = getReadingHistory();
      if (history.length > 0) {
        setHistoryItems(
          history.slice(0, 12).map((h) => ({
            id: h.comicId || h.id,
            title: h.comicTitle || "Comic",
            coverUrl: h.coverUrl,
            chapter: `Ch.${h.chapterNumber || 1}`,
            timeAgo: h.timeAgo || "Recently",
            progress: `${h.chapterNumber || 1} / ${h.totalChapters || 10}`,
          }))
        );
      }
    } catch {
      // Fallback
    }

    try {
      const saved = getSavedComics();
      if (saved.length > 0) {
        setFollowedItems(
          saved.slice(0, 10).map((s) => ({
            id: s.id,
            title: s.title,
            coverUrl: s.coverUrl,
            chapter: `Ch.${s.year || 1}`,
            timeAgo: "Saved",
            badgeLabel: "OK",
          }))
        );
      }
    } catch {
      // Fallback
    }
  }, []);

  // 1. Followed Comics rail items
  // Fallback "New Chapters from Followed Comics" when nothing is saved yet
  const displayFollowedItems: RailItem[] =
    followedItems.length > 0
      ? followedItems
      : latestChapters.slice(0, 10).map(({ chapter, manga }, idx) => ({
          id: manga.id,
          title: manga.title,
          coverUrl: manga.coverUrl,
          chapter: `Ch.${chapter.chapter || chapter.title?.split(" ").pop() || idx + 1}`,
          timeAgo: "1d ago",
          badgeLabel: `CL.${chapter.chapter || idx + 1}`,
        }));

  // 2. Most Recent Popular rail items
  const popularRailItems: RailItem[] = popularState.slice(0, 10).map((m, idx) => ({
    id: m.id,
    title: m.title,
    coverUrl: m.coverUrl,
    chapter: `Ch.${(idx + 1) * 15}`,
    timeAgo: `${(idx % 3) + 1}d ago`,
    rank: idx + 1,
    translatedLanguage: "en",
  }));

  // 3. Most Follows - New Comics rail items
  const newFollowsRailItems: RailItem[] = newFollowsState.slice(0, 10).map((m, idx) => ({
    id: m.id,
    title: m.title,
    coverUrl: m.coverUrl,
    chapter: `Ch.${(idx + 2) * 4}`,
    timeAgo: `${idx + 1}d ago`,
    rank: idx + 1,
    translatedLanguage: "en",
  }));

  // 4. Latest Updates items for multi-row grid (25 items per page)
  const allLatestItems = (
    latestTab === "Hot"
      ? popular.map((m, idx) => ({
          id: m.id,
          title: m.title,
          coverUrl: m.coverUrl,
          chapter: `Ch.${(idx + 1) * 7 + 12}`,
          timeAgo: `${(idx % 8) + 1}h ago`,
          type: m.type,
          translatedLanguage: "en",
        }))
      : latestChapters.map(({ chapter, manga }, idx) => ({
          id: manga.id,
          title: manga.title,
          coverUrl: manga.coverUrl,
          chapter: `Ch.${chapter.chapter || (idx + 1)}`,
          timeAgo: `${(idx % 12) + 1}h ago`,
          type: manga.type,
          translatedLanguage: chapter.translatedLanguage || "en",
        }))
  ).filter((item) => {
    if (latestTypeFilter === "oel") {
      if (item.type !== "oel" && item.type !== null) return false;
    } else if (latestTypeFilter && item.type !== latestTypeFilter) {
      return false;
    }
    return true;
  });

  const languageFilteredItems =
    selectedLanguage && latestTab === "New"
      ? allLatestItems.filter((item) => item.translatedLanguage === selectedLanguage)
      : allLatestItems;

  const isLanguageFallback =
    !!selectedLanguage && languageFilteredItems.length === 0 && latestTab === "New";

  const finalLatestItems = isLanguageFallback
    ? allLatestItems.filter((item) => !item.translatedLanguage || item.translatedLanguage === "en")
    : languageFilteredItems;

  const itemsPerPage = 25;
  const totalPages = Math.max(1, Math.ceil(finalLatestItems.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedLatestItems = finalLatestItems.slice(startIndex, startIndex + itemsPerPage);

  const TYPE_OPTIONS = [
    { value: "", label: "All types" },
    { value: "manga", label: "Manga" },
    { value: "manhwa", label: "Manhwa" },
    { value: "manhua", label: "Manhua" },
    { value: "oel", label: "Other" },
  ];

  return (
    <div className="min-w-0 space-y-8">
      {showAdultTrending && <AdultFeed serverEnabled />}

      {/* 1. New Chapters from Followed Comics */}
      <HomeFeedRail
        title="New Chapters from Followed Comics"
        items={displayFollowedItems}
        infoHref="/profile?tab=following-titles"
        hideBrowseRefresh
      />

      {/* 2. New (recently started series) */}
      <HomeFeedRail
        title="New"
        items={newSeries.map((m, idx) => ({
          id: m.id,
          title: m.title,
          coverUrl: m.coverUrl,
          chapter: `Ch.${(idx % 10) + 1}`,
          timeAgo: `${(idx % 4) + 1}d ago`,
          badgeLabel: `NEW`,
        }))}
        infoHref="/browse?order=createdAt"
      />

      {/* 3. Reading History */}
      <HomeFeedRail
        title="Reading History"
        items={historyItems}
        infoHref="/profile?tab=history"
        hideBrowseRefresh
      />

      {/* 4. Most Recent Popular */}
      <HomeFeedRail
        title="Most Recent Popular"
        items={popularRailItems}
        infoHref="/browse?order=rating"
        loading={popularLoading}
        headerActions={
          popularTime ? (
            <span className="inline-flex items-center rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
              {timeLabelOf(popularTime)}
            </span>
          ) : undefined
        }
        extraMenuItems={(onClose) =>
          TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setPopularTime(opt.value);
                fetchSection("popular", opt.value);
                onClose();
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                popularTime === opt.value
                  ? "text-white bg-zinc-800/70"
                  : "text-zinc-200 hover:text-white hover:bg-zinc-800/70"
              }`}
            >
              {opt.label}
            </button>
          ))
        }
      />

      {/* 5. Most Follows - New Comics */}
      <HomeFeedRail
        title="Most Follows - New Comics"
        items={newFollowsRailItems}
        infoHref="/browse?order=followedCount"
        loading={newFollowsLoading}
        headerActions={
          newFollowsTime ? (
            <span className="inline-flex items-center rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
              {timeLabelOf(newFollowsTime)}
            </span>
          ) : undefined
        }
        extraMenuItems={(onClose) =>
          TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setNewFollowsTime(opt.value);
                fetchSection("newFollows", opt.value);
                onClose();
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                newFollowsTime === opt.value
                  ? "text-white bg-zinc-800/70"
                  : "text-zinc-200 hover:text-white hover:bg-zinc-800/70"
              }`}
            >
              {opt.label}
            </button>
          ))
        }
      />

      {/* 6. Latest Updates (Multi-row 5-column Grid matching screenshot 004829.png) */}
      <section className="pt-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
              Latest Updates
            </h2>

            {/* Hot / New Tabs */}
            <div className="flex items-center gap-1 bg-[#14161b] p-0.5 rounded-lg border border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  setLatestTab("Hot");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  latestTab === "Hot"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Hot
              </button>
              <button
                type="button"
                onClick={() => {
                  setLatestTab("New");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  latestTab === "New"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                New
              </button>
            </div>
          </div>

          {/* Quick 3-dot dropdown more button */}
          <div ref={updatesMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUpdatesMenuOpen((prev) => !prev)}
              className={`h-6 w-6 rounded border transition-colors flex items-center justify-center cursor-pointer active:scale-95 ${
                isUpdatesMenuOpen
                  ? "border-zinc-700 bg-zinc-800 text-white"
                  : "border-zinc-800/80 bg-[#16181d] hover:bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
              title="More options"
              aria-label="More options"
              aria-expanded={isUpdatesMenuOpen}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {isUpdatesMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-zinc-800/90 bg-[#16181d]/95 backdrop-blur-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                role="menu"
              >
                <Link
                  href="/browse?order=latestUploadedChapter"
                  onClick={() => setIsUpdatesMenuOpen(false)}
                  className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors"
                  role="menuitem"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                  <span>All updates</span>
                </Link>
                <Link
                  href="/browse"
                  onClick={() => setIsUpdatesMenuOpen(false)}
                  className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors"
                  role="menuitem"
                >
                  <Compass className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                  <span>Browse comics</span>
                </Link>

                <div className="h-px bg-zinc-800/80 mx-1 my-1" />

                <div className="px-1 py-1 space-y-0.5">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setLatestTypeFilter(opt.value);
                        setCurrentPage(1);
                        setIsUpdatesMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        latestTypeFilter === opt.value
                          ? "text-white bg-zinc-800/70"
                          : "text-zinc-200 hover:text-white hover:bg-zinc-800/70"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="h-px bg-zinc-800/80 mx-1 my-1" />

                <div className="px-1 py-1 space-y-0.5">
                  {CONTENT_LANGUAGES.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage((prev) => (prev === opt.code ? "" : opt.code));
                        setLanguageFallback(false);
                        setCurrentPage(1);
                        setIsUpdatesMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedLanguage === opt.code
                          ? "text-white bg-zinc-800/70"
                          : "text-zinc-200 hover:text-white hover:bg-zinc-800/70"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="h-px bg-zinc-800/80 mx-1 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setLatestTab("Hot");
                    setLatestTypeFilter("");
                    setSelectedLanguage("");
                    setLanguageFallback(false);
                    setCurrentPage(1);
                    setIsUpdatesMenuOpen(false);
                  }}
                  className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors cursor-pointer text-left"
                  role="menuitem"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                  <span>Refresh</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid: 4-5 columns with enlarged comic cards */}
        {isLanguageFallback && (
          <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            No {selectedLanguage.toUpperCase()} chapters are available in latest updates. Showing English chapters instead.
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {displayedLatestItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="group flex flex-col">
              <Link
                href={`/manga/${item.id}`}
                className="block relative aspect-[3/4.2] w-full rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-md group-hover:border-zinc-700 transition-all"
              >
                {item.coverUrl ? (
                  <Image
                    src={item.coverUrl}
                    alt={item.title}
                    fill
                    sizes="220px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-mono text-zinc-600">
                    No Cover
                  </div>
                )}
              </Link>

              {/* Chapter & Time */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-zinc-400 mt-2 px-0.5">
                <span className="truncate">{item.chapter}</span>
                <span className="text-zinc-500 shrink-0 text-[10px] sm:text-[11px]">{item.timeAgo}</span>
              </div>

              {/* Title */}
              <Link href={`/manga/${item.id}`} className="block mt-1">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-[#DF301C] line-clamp-2 leading-snug transition-colors">
                  {item.title}
                </h3>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination: < Previous | Next > (matching screenshot 004829.png) */}
        <div className="flex items-center justify-center gap-3 mt-6 pt-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`px-4 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              currentPage <= 1
                ? "border-zinc-800/60 bg-zinc-900/40 text-zinc-600 cursor-not-allowed"
                : "border-zinc-800 bg-[#16181d] text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer active:scale-95"
            }`}
          >
            ‹ Previous
          </button>

          <span className="text-xs font-mono text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`px-4 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              currentPage >= totalPages
                ? "border-zinc-800/60 bg-zinc-900/40 text-zinc-600 cursor-not-allowed"
                : "border-zinc-800 bg-[#16181d] text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer active:scale-95"
            }`}
          >
            Next ›
          </button>
        </div>
      </section>

      {/* 7. Under Latest Updates: Upcoming Manhwa */}
      <HomeFeedRail
        title="Upcoming Manhwa"
        items={upcomingManhwa.length > 0 ? upcomingManhwa : popular.slice(0, 10)}
        infoHref="/browse?order=createdAt"
      />
    </div>
  );
}
