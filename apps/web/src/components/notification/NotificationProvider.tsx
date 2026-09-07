"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type NotificationTab = "comics" | "community";

export interface AppNotification {
  id: string;
  tab: NotificationTab;
  title: string;
  chapter?: string;
  comicId?: string;
  coverUrl?: string;
  timeAgo?: string;
  createdAt: string; // ISO timestamp
  read: boolean;
  message?: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  comicsUnreadCount: number;
  communityUnreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "ilovecomix-notifications-v2";

// Seed data matching screenshot exactly
const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    tab: "comics",
    title: "Kindergarten for Divine Beasts",
    chapter: "78",
    timeAgo: "1d ago",
    comicId: "aa62f35d-fde9-46bb-a351-985b13c491c4",
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-2",
    tab: "comics",
    title: "Secretly Strong and Searching for My Daddy",
    chapter: "49",
    timeAgo: "1d ago",
    comicId: "b4061c12-f107-412d-8565-978ce829c79f",
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-3",
    tab: "comics",
    title: "I Only Need the Duke's Child",
    chapter: "26.5",
    timeAgo: "1d ago",
    comicId: "b16f47a2-0a01-41d2-b90d-76367cb28459",
    coverUrl:
      "https://uploads.mangadex.org/covers/b16f47a2-0a01-41d2-b90d-76367cb28459/3bf77248-33d2-410a-bfcd-e864c1860388.png.256.jpg",
    createdAt: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-4",
    tab: "comics",
    title: "I Became A Married Man in Another World",
    chapter: "25",
    timeAgo: "2d ago",
    comicId: "0118e4d2-2dd8-44eb-8a42-0f8d53e809c4",
    coverUrl:
      "https://uploads.mangadex.org/covers/0118e4d2-2dd8-44eb-8a42-0f8d53e809c4/35816bfa-d0c7-4480-b733-2c5b2984a04d.jpg.256.jpg",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-5",
    tab: "comics",
    title: "Ultimate Shut-in",
    chapter: "95",
    timeAgo: "4d ago",
    comicId: "493eee8e-2f7a-49fa-94e3-8ac164e5718a",
    coverUrl:
      "https://uploads.mangadex.org/covers/493eee8e-2f7a-49fa-94e3-8ac164e5718a/504cac40-f9b6-436f-af7d-ebaff7c594b1.jpg.256.jpg",
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-6",
    tab: "comics",
    title: "The Father and the Daughter",
    chapter: "84",
    timeAgo: "5d ago",
    comicId: "f2d8a9aa-3617-4034-91bf-05c494fd7516",
    coverUrl:
      "https://uploads.mangadex.org/covers/f2d8a9aa-3617-4034-91bf-05c494fd7516/12862eb8-be46-4236-ba6c-a5ae5fe9b33c.jpg.256.jpg",
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-7",
    tab: "community",
    title: "Welcome to Ilovecomix Community!",
    message: "Discuss your favorite manga and share recommendations with fellow readers.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
];

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount (eliminates SSR hydration mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppNotification[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
        }
      }
    } catch {}
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      /* ignore */
    }
  }, [notifications, isInitialized]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const comicsUnreadCount = useMemo(
    () => notifications.filter((n) => n.tab === "comics" && !n.read).length,
    [notifications]
  );

  const communityUnreadCount = useMemo(
    () => notifications.filter((n) => n.tab === "community" && !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "read" | "createdAt">) => {
      const newNotification: AppNotification = {
        ...n,
        id: `n-${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        comicsUnreadCount,
        communityUnreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return ctx;
}
