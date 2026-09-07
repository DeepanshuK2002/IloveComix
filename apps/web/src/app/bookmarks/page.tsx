"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getSavedComics,
  toggleSaveComic,
  setComicFolder,
  FOLDER_OPTIONS,
  type SavedManga,
  type MangaFolder,
} from "@/lib/bookmarks";
import { useSearchModal } from "@/components/search/SearchModalContext";
import {
  Bookmark,
  Trash2,
  Play,
  Search,
  Compass,
  Star,
  BookOpen,
  Folder,
} from "lucide-react";

const FILTER_TABS = [
  { id: "all", label: "All Titles" },
  ...FOLDER_OPTIONS,
];

export default function BookmarksPage() {
  const [savedComics, setSavedComics] = useState<SavedManga[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loaded, setLoaded] = useState(false);
  const { openSearch } = useSearchModal();

  const loadSaved = () => {
    setSavedComics(getSavedComics());
    setLoaded(true);
  };

  useEffect(() => {
    loadSaved();

    const handleUpdate = () => {
      loadSaved();
    };

    window.addEventListener("ilovecomix-bookmarks-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ilovecomix-bookmarks-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleRemove = (comic: SavedManga) => {
    toggleSaveComic(comic);
    loadSaved();
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to remove all saved comics from your library?")) {
      localStorage.removeItem("ilovecomix-saved-comics");
      loadSaved();
      window.dispatchEvent(new CustomEvent("ilovecomix-bookmarks-changed"));
    }
  };

  const filteredComics =
    activeTab === "all"
      ? savedComics
      : savedComics.filter(
          (c) => (c.folder || "plan-to-read") === activeTab
        );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Bookmark className="h-4 w-4 fill-emerald-400" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Saved Library
            </h1>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1.5">
            Track reading progress across folders (Reading, Completed, On-Hold, Plan to Read, Dropped).
          </p>
        </div>

        {loaded && savedComics.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-xs font-mono text-zinc-300">
              {savedComics.length} {savedComics.length === 1 ? "Title" : "Titles"} Total
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Folder Filter Tabs */}
      {loaded && savedComics.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 custom-scrollbar">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.id === "all"
                ? savedComics.length
                : savedComics.filter(
                    (c) => (c.folder || "plan-to-read") === tab.id
                  ).length;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "border border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive ? "bg-black/10 text-black" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading Skeleton */}
      {!loaded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[3/4] rounded-xl bg-zinc-900/60 animate-pulse border border-zinc-800"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {loaded && (savedComics.length === 0 || filteredComics.length === 0) && (
        <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4">
            <BookOpen className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1.5">
            {savedComics.length === 0
              ? "No saved comics yet"
              : `No comics in "${FILTER_TABS.find((t) => t.id === activeTab)?.label}"`}
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-sm mx-auto mb-6 leading-relaxed">
            {savedComics.length === 0
              ? "Search for your favorite manga, manhwa, or manhua and select 'Move to folder' or click the Save icon to keep track of your reading list."
              : "Move comics to this folder from the comic page or choose another folder tab above."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openSearch()}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Open Search
            </button>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              Browse Popular
            </Link>
          </div>
        </div>
      )}

      {/* Saved Comics Grid */}
      {loaded && filteredComics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredComics.map((comic) => {
            const formattedType =
              comic.type === "manga"
                ? "Manga"
                : comic.type === "manhwa"
                ? "Manhwa"
                : comic.type === "manhua"
                ? "Manhua"
                : "Comic";

            const folderObj = FOLDER_OPTIONS.find(
              (f) => f.id === (comic.folder || "plan-to-read")
            );

            return (
              <div
                key={comic.id}
                className="group relative flex flex-col rounded-2xl border border-zinc-800/80 bg-[#0e0e11] overflow-hidden transition-all hover:border-zinc-700 hover:shadow-lg"
              >
                {/* Cover Image */}
                <Link
                  href={`/manga/${comic.id}`}
                  className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 block"
                >
                  {comic.coverUrl ? (
                    <Image
                      src={comic.coverUrl}
                      alt={comic.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-mono text-zinc-500">
                      No Cover
                    </div>
                  )}

                  {/* Badges: Type & Folder */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="inline-flex items-center rounded border border-black/40 bg-black/80 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono text-zinc-200 uppercase">
                      {formattedType}
                    </span>
                    {folderObj && (
                      <span className="inline-flex items-center gap-1 rounded border border-black/40 bg-black/80 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono text-zinc-200">
                        <span className={`h-1.5 w-1.5 rounded-full ${folderObj.dotColor}`} />
                        {folderObj.label}
                      </span>
                    )}
                  </div>

                  {/* Remove Button on Hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(comic);
                    }}
                    className="absolute top-2 right-2 rounded-lg bg-black/80 backdrop-blur-md border border-zinc-700/80 p-1.5 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
                    title="Remove from saved library"
                    aria-label={`Remove ${comic.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </Link>

                {/* Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <Link
                      href={`/manga/${comic.id}`}
                      className="text-xs sm:text-sm font-bold text-white line-clamp-1 hover:text-zinc-300 transition-colors"
                      title={comic.title}
                    >
                      {comic.title}
                    </Link>

                    <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>{comic.year || (comic.status === "ongoing" ? "Ongoing" : "Completed")}</span>
                      {comic.rating && comic.rating > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                          {comic.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                    <Link
                      href={`/manga/${comic.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors shadow-sm"
                    >
                      <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                      Read
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(comic)}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      title="Remove bookmark"
                    >
                      <Bookmark className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
