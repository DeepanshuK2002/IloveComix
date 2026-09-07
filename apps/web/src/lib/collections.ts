"use client";

import { useState, useEffect } from "react";

export interface UserCollection {
  id: string;
  name: string;
  description?: string;
  comicIds: string[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "ilovecomix-collections";

export function getCollections(): UserCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCollections(collections: UserCollection[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    window.dispatchEvent(new CustomEvent("ilovecomix-collections-changed"));
  } catch (err) {
    console.error("Failed to save collections:", err);
  }
}

export function createCollection(name: string, initialComicId?: string): UserCollection {
  const collections = getCollections();
  const newCol: UserCollection = {
    id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    comicIds: initialComicId ? [initialComicId] : [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  collections.unshift(newCol);
  saveCollections(collections);
  return newCol;
}

export function toggleComicInCollection(collectionId: string, comicId: string): boolean {
  const collections = getCollections();
  const col = collections.find((c) => c.id === collectionId);
  if (!col) return false;

  const idx = col.comicIds.indexOf(comicId);
  let isAdded = false;
  if (idx >= 0) {
    col.comicIds.splice(idx, 1);
    isAdded = false;
  } else {
    col.comicIds.push(comicId);
    isAdded = true;
  }

  col.updatedAt = Date.now();
  saveCollections(collections);
  return isAdded;
}

export function isComicInCollection(collectionId: string, comicId: string): boolean {
  const collections = getCollections();
  const col = collections.find((c) => c.id === collectionId);
  return col ? col.comicIds.includes(comicId) : false;
}

export function getComicCollections(comicId: string): UserCollection[] {
  const collections = getCollections();
  return collections.filter((c) => c.comicIds.includes(comicId));
}

export function useCollections(comicId?: string) {
  const [collections, setCollections] = useState<UserCollection[]>([]);

  const refresh = () => {
    setCollections(getCollections());
  };

  useEffect(() => {
    refresh();

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener("ilovecomix-collections-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ilovecomix-collections-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addCollection = (name: string, initialComic?: string) => {
    const created = createCollection(name, initialComic);
    refresh();
    return created;
  };

  const toggle = (colId: string, cId: string) => {
    const res = toggleComicInCollection(colId, cId);
    refresh();
    return res;
  };

  const memberCollections = comicId
    ? collections.filter((c) => c.comicIds.includes(comicId))
    : [];

  return {
    collections,
    memberCollections,
    addCollection,
    toggle,
    refresh,
  };
}
