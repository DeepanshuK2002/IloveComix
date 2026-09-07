"use client";

import { useState, useEffect } from "react";

export type MangaFolder =
  | "reading"
  | "completed"
  | "on-hold"
  | "plan-to-read"
  | "dropped";

export interface SavedManga {
  id: string;
  title: string;
  coverUrl: string | null;
  type: string | null;
  year?: number | null;
  rating?: number;
  status?: string;
  tags?: string[];
  folder?: MangaFolder;
  savedAt: number;
}

export const FOLDER_OPTIONS: {
  id: MangaFolder;
  label: string;
  color: string;
  dotColor: string;
}[] = [
  { id: "reading", label: "Reading", color: "text-emerald-400", dotColor: "bg-emerald-500" },
  { id: "completed", label: "Completed", color: "text-purple-400", dotColor: "bg-purple-500" },
  { id: "on-hold", label: "On-Hold", color: "text-amber-400", dotColor: "bg-amber-500" },
  { id: "plan-to-read", label: "Plan to Read", color: "text-sky-400", dotColor: "bg-sky-500" },
  { id: "dropped", label: "Dropped", color: "text-rose-400", dotColor: "bg-rose-500" },
];

const STORAGE_KEY = "ilovecomix-saved-comics";

export function getSavedComics(): SavedManga[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isComicSaved(id: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getSavedComics();
  return list.some((item) => item.id === id);
}

export function getComicFolder(id: string): MangaFolder | null {
  if (typeof window === "undefined") return null;
  const list = getSavedComics();
  const found = list.find((item) => item.id === id);
  if (!found) return null;
  return found.folder || "plan-to-read";
}

export function setComicFolder(
  comic: {
    id: string;
    title: string;
    coverUrl: string | null;
    type?: string | null;
    year?: number | null;
    rating?: number;
    status?: string;
    tags?: (string | { name: string })[];
  },
  folder: MangaFolder
): void {
  if (typeof window === "undefined") return;
  try {
    const list = getSavedComics();
    const existingIndex = list.findIndex((item) => item.id === comic.id);

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        folder,
        savedAt: Date.now(),
      };
    } else {
      list.unshift({
        id: comic.id,
        title: comic.title,
        coverUrl: comic.coverUrl,
        type: comic.type ?? null,
        year: comic.year,
        rating: comic.rating,
        status: comic.status,
        tags: comic.tags?.map((t) => (typeof t === "string" ? t : t.name)),
        folder,
        savedAt: Date.now(),
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent("ilovecomix-bookmarks-changed", {
        detail: { id: comic.id, isSaved: true, folder },
      })
    );
  } catch (err) {
    console.error("Failed to set comic folder:", err);
  }
}

export function unfollowComic(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getSavedComics();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(
      new CustomEvent("ilovecomix-bookmarks-changed", {
        detail: { id, isSaved: false, folder: null },
      })
    );
  } catch (err) {
    console.error("Failed to unfollow comic:", err);
  }
}

export function toggleSaveComic(comic: {
  id: string;
  title: string;
  coverUrl: string | null;
  type?: string | null;
  year?: number | null;
  rating?: number;
  status?: string;
  tags?: (string | { name: string })[];
}): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getSavedComics();
    const existingIndex = list.findIndex((item) => item.id === comic.id);

    let isSavedNow = false;
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      isSavedNow = false;
    } else {
      list.unshift({
        id: comic.id,
        title: comic.title,
        coverUrl: comic.coverUrl,
        type: comic.type ?? null,
        year: comic.year,
        rating: comic.rating,
        status: comic.status,
        tags: comic.tags?.map((t) => (typeof t === "string" ? t : t.name)),
        folder: "plan-to-read",
        savedAt: Date.now(),
      });
      isSavedNow = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent("ilovecomix-bookmarks-changed", {
        detail: { id: comic.id, isSaved: isSavedNow, folder: isSavedNow ? "plan-to-read" : null },
      })
    );
    return isSavedNow;
  } catch {
    return false;
  }
}

export function useSavedComicStatus(comicId: string) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isComicSaved(comicId));

    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.id === comicId) {
        setIsSaved(isComicSaved(comicId));
      }
    };

    window.addEventListener("ilovecomix-bookmarks-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ilovecomix-bookmarks-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [comicId]);

  const toggle = (comic: Parameters<typeof toggleSaveComic>[0]) => {
    const next = toggleSaveComic(comic);
    setIsSaved(next);
    return next;
  };

  return { isSaved, toggle };
}

export function useComicFolder(comicId: string) {
  const [currentFolder, setCurrentFolder] = useState<MangaFolder | null>(null);

  useEffect(() => {
    setCurrentFolder(getComicFolder(comicId));

    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.id === comicId) {
        setCurrentFolder(getComicFolder(comicId));
      }
    };

    window.addEventListener("ilovecomix-bookmarks-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ilovecomix-bookmarks-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [comicId]);

  const moveToFolder = (
    comic: Parameters<typeof setComicFolder>[0],
    folder: MangaFolder
  ) => {
    setComicFolder(comic, folder);
    setCurrentFolder(folder);
  };

  const unfollow = () => {
    unfollowComic(comicId);
    setCurrentFolder(null);
  };

  return {
    currentFolder,
    moveToFolder,
    unfollow,
  };
}
