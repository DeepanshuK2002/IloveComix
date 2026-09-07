"use client";

import { useState, useRef, useEffect } from "react";
import type { Manga } from "@/lib/types";
import {
  useComicFolder,
  FOLDER_OPTIONS,
  type MangaFolder,
} from "@/lib/bookmarks";
import {
  BookOpen,
  CheckCircle2,
  PauseCircle,
  Bookmark,
  XCircle,
  Trash2,
  ChevronDown,
  Check,
  FolderPlus,
} from "lucide-react";

interface FolderSelectProps {
  manga: Manga;
}

const FOLDER_ICONS: Record<MangaFolder, React.ComponentType<{ className?: string }>> = {
  reading: BookOpen,
  completed: CheckCircle2,
  "on-hold": PauseCircle,
  "plan-to-read": Bookmark,
  dropped: XCircle,
};

export function FolderSelect({ manga }: FolderSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentFolder, moveToFolder, unfollow } = useComicFolder(manga.id);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const activeOption = FOLDER_OPTIONS.find((f) => f.id === currentFolder);
  const ActiveIcon = currentFolder ? FOLDER_ICONS[currentFolder] : FolderPlus;

  const handleSelectFolder = (folder: MangaFolder) => {
    moveToFolder(
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
    setIsOpen(false);
  };

  const handleUnfollow = () => {
    unfollow();
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all w-full focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none ${
          currentFolder
            ? "border border-zinc-700/80 bg-zinc-900/90 text-white hover:bg-zinc-800/90 shadow-sm"
            : "bg-white text-black hover:bg-zinc-200 shadow-sm"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 min-w-0">
          {currentFolder && activeOption ? (
            <>
              <span className={`h-2 w-2 rounded-full ${activeOption.dotColor} shrink-0 animate-pulse`} />
              <ActiveIcon className={`h-4 w-4 ${activeOption.color} shrink-0`} />
              <span className="truncate">{activeOption.label}</span>
            </>
          ) : (
            <>
              <FolderPlus className="h-4 w-4 text-zinc-700 shrink-0" />
              <span>Move to folder</span>
            </>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 z-30 w-full min-w-[210px] rounded-2xl border border-zinc-800 bg-[#0e0e12] p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
          role="listbox"
        >
          {/* Header */}
          <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80">
            Move to folder
          </div>

          {/* Folder Options */}
          <div className="py-1 space-y-0.5">
            {FOLDER_OPTIONS.map((opt) => {
              const Icon = FOLDER_ICONS[opt.id];
              const isSelected = currentFolder === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectFolder(opt.id)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left group ${
                    isSelected
                      ? "bg-zinc-800/90 text-white font-semibold shadow-inner"
                      : "text-zinc-300 hover:bg-zinc-900/90 hover:text-white"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${opt.dotColor} shrink-0`}
                    />
                    <Icon className={`h-3.5 w-3.5 ${opt.color} shrink-0`} />
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-zinc-800/80" />

          {/* Unfollow Option */}
          <button
            type="button"
            onClick={handleUnfollow}
            disabled={!currentFolder}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
              currentFolder
                ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                : "text-zinc-600 cursor-not-allowed"
            }`}
            role="option"
            aria-selected={false}
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Unfollow</span>
            </div>
            {currentFolder && (
              <span className="text-[10px] font-mono text-zinc-500">Remove</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
