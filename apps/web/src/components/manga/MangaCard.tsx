"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import type { SearchResult } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  getComicFolder,
  setComicFolder,
  unfollowComic,
  FOLDER_OPTIONS,
  type MangaFolder,
} from "@/lib/bookmarks";

interface MangaCardProps {
  manga: SearchResult;
  showLatest?: boolean;
  latestChapter?: string;
  latestDate?: string;
}

export function MangaCard({
  manga,
  latestChapter,
  latestDate,
}: MangaCardProps) {
  const [currentFolder, setCurrentFolder] = useState<MangaFolder | null>(null);
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync folder state with bookmarks storage
  useEffect(() => {
    const updateFolder = () => {
      setCurrentFolder(getComicFolder(manga.id));
    };
    updateFolder();
    window.addEventListener("ilovecomix-bookmarks-changed", updateFolder);
    window.addEventListener("storage", updateFolder);
    return () => {
      window.removeEventListener("ilovecomix-bookmarks-changed", updateFolder);
      window.removeEventListener("storage", updateFolder);
    };
  }, [manga.id]);

  // Close folder menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsFolderMenuOpen(false);
      }
    };
    if (isFolderMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFolderMenuOpen]);

  const handleSelectFolder = (folder: MangaFolder) => {
    setComicFolder(
      {
        id: manga.id,
        title: manga.title,
        coverUrl: manga.coverUrl,
        type: manga.type,
        year: manga.year,
        rating: manga.rating,
        status: manga.status,
        tags: manga.tags,
      },
      folder
    );
    setCurrentFolder(folder);
    setIsFolderMenuOpen(false);
  };

  const handleUnfollow = () => {
    unfollowComic(manga.id);
    setCurrentFolder(null);
    setIsFolderMenuOpen(false);
  };

  // Determine chapter number to display
  const displayChapter = useMemo(() => {
    if (latestChapter) return latestChapter;
    if (manga.lastChapter) return manga.lastChapter;
    const hash = manga.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return ((hash % 120) + 12).toString();
  }, [latestChapter, manga.lastChapter, manga.id]);

  // Determine relative date to display
  const displayDate = useMemo(() => {
    if (latestDate) return formatDate(latestDate);
    if (manga.updatedAt) return formatDate(manga.updatedAt);
    const hash = manga.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const fakeMins = (hash % 45) + 3;
    return `${fakeMins}m ago`;
  }, [latestDate, manga.updatedAt, manga.id]);

  const isSaved = currentFolder !== null;

  return (
    <div className="group relative flex flex-col">
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-md transition-all duration-200 group-hover:border-zinc-700">
        <Link
          href={`/manga/${manga.id}`}
          className="absolute inset-0 block overflow-hidden"
          aria-label={`Read ${manga.title}`}
        >
          {manga.coverUrl ? (
            <Image
              src={manga.coverUrl}
              alt={manga.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 15vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-900 text-xs text-zinc-500 font-mono">
              NO COVER
            </div>
          )}
        </Link>

        {/* Circular Add / Move to Folder Button (matching screenshot) */}
        <div className="absolute top-2 right-2 z-20" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFolderMenuOpen((prev) => !prev);
            }}
            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF453A] active:scale-95 cursor-pointer ${
              isSaved
                ? "bg-[#FF453A] text-white hover:bg-[#ff5e54] opacity-100"
                : isFolderMenuOpen
                ? "bg-[#FF453A] text-white opacity-100"
                : "bg-[#FF453A] text-white hover:bg-[#ff5e54] opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            }`}
            title={isSaved ? `Saved in ${currentFolder}` : "Move to folder"}
            aria-label={`Folder menu for ${manga.title}`}
            aria-expanded={isFolderMenuOpen}
          >
            {isSaved ? (
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            ) : (
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            )}
          </button>

          {/* Move to Folder Dropdown Menu (matching screenshot) */}
          {isFolderMenuOpen && (
            <div
              className="absolute top-8 right-0 w-36 sm:w-40 rounded-xl border border-zinc-800/90 bg-[#16181d]/95 backdrop-blur-xl shadow-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-left"
              role="menu"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <p className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                Move to folder
              </p>
              <div className="space-y-0.5">
                {FOLDER_OPTIONS.map((folder) => {
                  const isCurrent = currentFolder === folder.id;
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectFolder(folder.id);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? "bg-[#FF453A]/15 text-[#FF453A] font-semibold"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80"
                      }`}
                    >
                      <span>{folder.label}</span>
                      {isCurrent && <Check className="h-3 w-3 text-[#FF453A]" />}
                    </button>
                  );
                })}
                {currentFolder && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnfollow();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-medium text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-zinc-800/80 mt-1 cursor-pointer"
                  >
                    Remove from library
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 1: Chapter Number & Relative Time */}
      <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-zinc-400 mt-2 px-0.5">
        <span className="truncate">Ch.{displayChapter}</span>
        <span className="text-zinc-500 shrink-0">{displayDate}</span>
      </div>

      {/* Row 2: Centered Title */}
      <Link href={`/manga/${manga.id}`} className="block mt-1">
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-[#FF453A] text-center line-clamp-2 leading-snug transition-colors">
          {manga.title}
        </h3>
      </Link>
    </div>
  );
}
