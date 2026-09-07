"use client";

import { getSavedComics, type SavedManga } from "./bookmarks";

export interface UserProfile {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: string;
  email: string;
}

export interface HistoryEntry {
  id: string;
  comicId: string;
  comicTitle: string;
  coverUrl: string;
  chapterId: string;
  chapterNumber: string;
  totalChapters: number;
  timeAgo?: string;
  timestamp: number;
  completed: boolean;
  percent: number;
}

export interface UserComment {
  id: string;
  comicId: string;
  comicTitle: string;
  coverUrl: string;
  text: string;
  timestamp: number;
  timeAgo?: string;
  likes: number;
  dislikes: number;
  replies: number;
}

export interface UserCollection {
  id: string;
  title: string;
  description: string;
  comicCount: number;
  likes: number;
  isMine: boolean;
  coverUrl?: string;
  createdAt: number;
}

export interface ProfileSettings {
  profileVisibility: {
    hideWall: boolean;
    hideRecentComments: boolean;
    hideRecentReads: boolean;
    hideStats: boolean;
  };
  homePage: {
    showFollowingTitles: boolean;
    showReadingHistory: boolean;
    folders: {
      reading: boolean;
      completed: boolean;
      onHold: boolean;
      planToRead: boolean;
      dropped: boolean;
    };
  };
  comments: {
    autoLoadComments: boolean;
  };
  notifications: {
    folders: {
      reading: boolean;
      completed: boolean;
      onHold: boolean;
      planToRead: boolean;
      dropped: boolean;
    };
    notifyOnCommentLikes: boolean;
  };
}

const PROFILE_KEY = "ilovecomix-user-profile-v1";
const HISTORY_KEY = "ilovecomix-user-history-v1";
const COMMENTS_KEY = "ilovecomix-user-comments-v1";
const COLLECTIONS_KEY = "ilovecomix-user-collections-v1";
const SETTINGS_KEY = "ilovecomix-user-settings-v1";

export const DEFAULT_PROFILE: UserProfile = {
  displayName: "Mosimosi",
  username: "mosimosimomo69",
  bio: "",
  avatarUrl: null,
  socialLinks: "https://twitter.com/yourhandle\nhttps://bsky.app/profile/you.bsky.social\nhttps://your-site.com",
  email: "mosimosimomo69@gmail.com",
};

export const DEFAULT_SETTINGS: ProfileSettings = {
  profileVisibility: {
    hideWall: false,
    hideRecentComments: false,
    hideRecentReads: false,
    hideStats: false,
  },
  homePage: {
    showFollowingTitles: true,
    showReadingHistory: true,
    folders: {
      reading: true,
      completed: false,
      onHold: false,
      planToRead: false,
      dropped: false,
    },
  },
  comments: {
    autoLoadComments: true,
  },
  notifications: {
    folders: {
      reading: true,
      completed: false,
      onHold: false,
      planToRead: false,
      dropped: false,
    },
    notifyOnCommentLikes: true,
  },
};

export const SEED_HISTORY: HistoryEntry[] = [
  {
    id: "h-1",
    comicId: "aa62f35d-fde9-46bb-a351-985b13c491c4",
    comicTitle: "MILF Hunter in Another World",
    chapterId: "ch-1",
    chapterNumber: "1",
    totalChapters: 133,
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
    timestamp: Date.now() - 29 * 60 * 1000,
    timeAgo: "29m ago",
    completed: false,
    percent: 1,
  },
  {
    id: "h-2",
    comicId: "b4061c12-f107-412d-8565-978ce829c79f",
    comicTitle: "The Wall Street Genius's Final Investment Playbook",
    chapterId: "ch-2",
    chapterNumber: "1",
    totalChapters: 6,
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
    timestamp: Date.now() - 48 * 60 * 1000,
    timeAgo: "48m ago",
    completed: false,
    percent: 16,
  },
  {
    id: "h-3",
    comicId: "b16f47a2-0a01-41d2-b90d-76367cb28459",
    comicTitle: "My S-Class Hunters",
    chapterId: "ch-3",
    chapterNumber: "175",
    totalChapters: 180,
    coverUrl:
      "https://uploads.mangadex.org/covers/b16f47a2-0a01-41d2-b90d-76367cb28459/3bf77248-33d2-410a-bfcd-e864c1860388.png.256.jpg",
    timestamp: Date.now() - 60 * 60 * 1000,
    timeAgo: "1h ago",
    completed: false,
    percent: 97,
  },
  {
    id: "h-4",
    comicId: "0118e4d2-2dd8-44eb-8a42-0f8d53e809c4",
    comicTitle: "Affair Agency",
    chapterId: "ch-4",
    chapterNumber: "14",
    totalChapters: 14,
    coverUrl:
      "https://uploads.mangadex.org/covers/0118e4d2-2dd8-44eb-8a42-0f8d53e809c4/35816bfa-d0c7-4480-b733-2c5b2984a04d.jpg.256.jpg",
    timestamp: Date.now() - 60 * 60 * 1000,
    timeAgo: "1h ago",
    completed: true,
    percent: 100,
  },
  {
    id: "h-5",
    comicId: "493eee8e-2f7a-49fa-94e3-8ac164e5718a",
    comicTitle: "An Introduction to MILFs",
    chapterId: "ch-5",
    chapterNumber: "82",
    totalChapters: 91,
    coverUrl:
      "https://uploads.mangadex.org/covers/493eee8e-2f7a-49fa-94e3-8ac164e5718a/504cac40-f9b6-436f-af7d-ebaff7c594b1.jpg.256.jpg",
    timestamp: Date.now() - 65 * 60 * 1000,
    timeAgo: "1h ago",
    completed: true,
    percent: 90,
  },
  {
    id: "h-6",
    comicId: "divine-beasts",
    comicTitle: "Kindergarten for Divine Beasts",
    chapterId: "ch-6",
    chapterNumber: "78",
    totalChapters: 78,
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    timeAgo: "1d ago",
    completed: true,
    percent: 100,
  },
];

export const SEED_COMMENTS: UserComment[] = [
  {
    id: "c-1",
    comicId: "aa62f35d-fde9-46bb-a351-985b13c491c4",
    comicTitle: "Genius Archer's Livestreaming",
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
    text: "I am so disappointed with new manhwa that by there name you see something new / fresh but when you reach or cross 20 -30 chapter whytf they are similar to other stories as predictable as they can",
    timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
    timeAgo: "2w ago",
    likes: 1,
    dislikes: 0,
    replies: 0,
  },
  {
    id: "c-2",
    comicId: "b4061c12-f107-412d-8565-978ce829c79f",
    comicTitle: "30 Years Have Passed Since the Prologue",
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
    text: "Who is the black hair guy with a status window. Is he a new main character or all the people will get the status window?",
    timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
    timeAgo: "1mo ago",
    likes: 0,
    dislikes: 0,
    replies: 0,
  },
  {
    id: "c-3",
    comicId: "b16f47a2-0a01-41d2-b90d-76367cb28459",
    comicTitle: "Secretly Strong and Searching for My Daddy",
    coverUrl:
      "https://uploads.mangadex.org/covers/b16f47a2-0a01-41d2-b90d-76367cb28459/3bf77248-33d2-410a-bfcd-e864c1860388.png.256.jpg",
    text: "Oooooo",
    timestamp: Date.now() - 32 * 24 * 60 * 60 * 1000,
    timeAgo: "1mo ago",
    likes: 0,
    dislikes: 0,
    replies: 0,
  },
];

// Profile storage
export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const updated = { ...current, ...profile };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("ilovecomix-user-sync"));
    } catch {
      /* ignore */
    }
  }
  return updated;
}

// Reading history storage
export function getReadingHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return SEED_HISTORY;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return SEED_HISTORY;
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const history = getReadingHistory();
    // remove existing entry for same comic to bring it to top
    const filtered = history.filter((h) => h.comicId !== entry.comicId);
    const newEntry: HistoryEntry = {
      ...entry,
      id: `h-${Date.now()}`,
      timestamp: Date.now(),
      timeAgo: "Just now",
    };
    const updated = [newEntry, ...filtered];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ilovecomix-user-sync"));
  } catch {
    /* ignore */
  }
}

// Comments storage
export function getUserComments(): UserComment[] {
  if (typeof window === "undefined") return SEED_COMMENTS;
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return SEED_COMMENTS;
}

export function addUserComment(comment: Omit<UserComment, "id" | "timestamp" | "likes" | "dislikes" | "replies">): void {
  if (typeof window === "undefined") return;
  try {
    const comments = getUserComments();
    const newComment: UserComment = {
      ...comment,
      id: `c-${Date.now()}`,
      timestamp: Date.now(),
      timeAgo: "Just now",
      likes: 0,
      dislikes: 0,
      replies: 0,
    };
    const updated = [newComment, ...comments];
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ilovecomix-user-sync"));
  } catch {
    /* ignore */
  }
}

// Collections storage
export function getUserCollections(): UserCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addUserCollection(col: Omit<UserCollection, "id" | "createdAt" | "likes" | "isMine">): void {
  if (typeof window === "undefined") return;
  try {
    const current = getUserCollections();
    const newCol: UserCollection = {
      ...col,
      id: `col-${Date.now()}`,
      createdAt: Date.now(),
      likes: 0,
      isMine: true,
    };
    const updated = [newCol, ...current];
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ilovecomix-user-sync"));
  } catch {
    /* ignore */
  }
}

// Settings storage
export function getProfileSettings(): ProfileSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveProfileSettings(settings: Partial<ProfileSettings>): ProfileSettings {
  const current = getProfileSettings();
  const updated = {
    ...current,
    ...settings,
    profileVisibility: { ...current.profileVisibility, ...settings.profileVisibility },
    homePage: { ...current.homePage, ...settings.homePage },
    comments: { ...current.comments, ...settings.comments },
    notifications: { ...current.notifications, ...settings.notifications },
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("ilovecomix-user-sync"));
    } catch {
      /* ignore */
    }
  }
  return updated;
}
