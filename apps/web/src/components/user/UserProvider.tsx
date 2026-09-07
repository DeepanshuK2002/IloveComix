"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  type UserProfile,
  type HistoryEntry,
  type UserComment,
  type UserCollection,
  type ProfileSettings,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  getUserProfile,
  saveUserProfile,
  getReadingHistory,
  addHistoryEntry,
  getUserComments,
  addUserComment,
  getUserCollections,
  addUserCollection,
  getProfileSettings,
  saveProfileSettings,
} from "@/lib/user";
import { getSavedComics, type SavedManga } from "@/lib/bookmarks";

export interface UserStats {
  titles: number;
  groups: number;
  chapters: number;
  comments: number;
  collections: number;
  likes: number;
}

interface UserContextValue {
  profile: UserProfile;
  stats: UserStats;
  history: HistoryEntry[];
  comments: UserComment[];
  collections: UserCollection[];
  settings: ProfileSettings;
  savedComics: SavedManga[];
  updateProfile: (data: Partial<UserProfile>) => void;
  recordRead: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  postComment: (
    comment: Omit<UserComment, "id" | "timestamp" | "likes" | "dislikes" | "replies">
  ) => void;
  createCollection: (
    col: Omit<UserCollection, "id" | "createdAt" | "likes" | "isMine">
  ) => void;
  updateSettings: (data: Partial<ProfileSettings>) => void;
  refresh: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);
  const [savedComics, setSavedComics] = useState<SavedManga[]>([]);

  const loadAll = useCallback(() => {
    setProfile(getUserProfile());
    setHistory(getReadingHistory());
    setComments(getUserComments());
    setCollections(getUserCollections());
    setSettings(getProfileSettings());
    setSavedComics(getSavedComics());
  }, []);

  useEffect(() => {
    loadAll();

    const handleSync = () => {
      loadAll();
    };

    window.addEventListener("ilovecomix-user-sync", handleSync);
    window.addEventListener("ilovecomix-bookmarks-changed", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("ilovecomix-user-sync", handleSync);
      window.removeEventListener("ilovecomix-bookmarks-changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadAll]);

  // Dynamically calculate stats
  const stats = useMemo<UserStats>(() => {
    // 9 default titles or actual saved count if user added more
    const titlesCount = Math.max(9, savedComics.length);
    // 546 default chapters read or computed from history
    const chaptersCount = Math.max(
      546,
      history.reduce((acc, h) => acc + (parseInt(h.chapterNumber, 10) || 1), 0)
    );
    const commentsCount = comments.length;
    const collectionsCount = collections.filter((c) => c.isMine).length;

    return {
      titles: titlesCount,
      groups: 0,
      chapters: chaptersCount,
      comments: commentsCount,
      collections: collectionsCount,
      likes: 1,
    };
  }, [savedComics, history, comments, collections]);

  const handleUpdateProfile = useCallback((data: Partial<UserProfile>) => {
    const updated = saveUserProfile(data);
    setProfile(updated);
  }, []);

  const handleRecordRead = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      addHistoryEntry(entry);
      setHistory(getReadingHistory());
    },
    []
  );

  const handlePostComment = useCallback(
    (
      comment: Omit<
        UserComment,
        "id" | "timestamp" | "likes" | "dislikes" | "replies"
      >
    ) => {
      addUserComment(comment);
      setComments(getUserComments());
    },
    []
  );

  const handleCreateCollection = useCallback(
    (col: Omit<UserCollection, "id" | "createdAt" | "likes" | "isMine">) => {
      addUserCollection(col);
      setCollections(getUserCollections());
    },
    []
  );

  const handleUpdateSettings = useCallback(
    (data: Partial<ProfileSettings>) => {
      const updated = saveProfileSettings(data);
      setSettings(updated);
    },
    []
  );

  return (
    <UserContext.Provider
      value={{
        profile,
        stats,
        history,
        comments,
        collections,
        settings,
        savedComics,
        updateProfile: handleUpdateProfile,
        recordRead: handleRecordRead,
        postComment: handlePostComment,
        createCollection: handleCreateCollection,
        updateSettings: handleUpdateSettings,
        refresh: loadAll,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
