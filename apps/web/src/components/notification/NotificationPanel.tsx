"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Check, ChevronRight, Inbox } from "lucide-react";
import {
  useNotifications,
  type AppNotification,
  type NotificationTab,
} from "@/components/notification/NotificationProvider";
import { formatDate } from "@/lib/utils";

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    comicsUnreadCount,
    communityUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<NotificationTab>("comics");

  const filteredNotifications = notifications.filter(
    (n) => n.tab === activeTab
  );

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-800/90 bg-[#16181d]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 text-left animate-in fade-in zoom-in-95 duration-150"
      role="menu"
      aria-orientation="vertical"
    >
      {/* 1. Header with inline Comics & Community tabs + NOTIFICATIONS label */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5 border-b border-zinc-800/60">
        <div>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
            NOTIFICATIONS
          </p>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>

        {/* Inline Comics & Community tabs (switch style, matching theme) */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-zinc-800/80 bg-zinc-900/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("comics")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "comics"
                ? "bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/40 shadow-sm"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <span>Comics</span>
            {comicsUnreadCount > 0 && (
              <span className="bg-[#DF301C] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shrink-0">
                {comicsUnreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("community")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "community"
                ? "bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/40 shadow-sm"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <span>Community</span>
            {communityUnreadCount > 0 && (
              <span className="bg-[#DF301C] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shrink-0">
                {communityUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mark as read row */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800/60 bg-[#14161b] text-xs">
          <span className="text-[11px] font-mono text-zinc-500">
            {unreadCount} unread
          </span>
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Mark all read
          </button>
        </div>
      )}

      {/* Notifications List (scrollable) */}
      <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800/60">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">
              {activeTab === "comics"
                ? "No comic release updates right now."
                : "No community notifications."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <Link
              key={n.id}
              href={n.comicId ? `/manga/${n.comicId}` : "/browse"}
              onClick={() => {
                markAsRead(n.id);
                onClose?.();
              }}
              className={`flex items-center justify-between gap-3 p-3 transition-colors hover:bg-zinc-800/50 group ${
                n.read ? "opacity-75" : ""
              }`}
            >
              {/* Left: Round red Bell icon */}
              <div className="h-9 w-9 rounded-full bg-[#DF301C]/15 flex items-center justify-center text-[#DF301C] shrink-0 shadow-sm">
                <Bell className="h-4 w-4" />
              </div>

              {/* Center: Comic Title & Subtitle */}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-[#DF301C] transition-colors line-clamp-1">
                  {n.title}
                </h4>
                <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                  {n.timeAgo || formatDate(n.createdAt)}
                  {n.chapter ? ` · Ch.${n.chapter}` : ""}
                </p>
                {n.message && (
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {n.message}
                  </p>
                )}
              </div>

              {/* Right: Small Poster Cover Thumbnail */}
              {n.coverUrl ? (
                <div className="relative h-14 w-10 rounded-lg overflow-hidden shrink-0 border border-zinc-800/80 bg-zinc-900 shadow-sm">
                  <Image
                    src={n.coverUrl}
                    alt={n.title}
                    fill
                    sizes="40px"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-14 w-10 rounded-lg shrink-0 border border-zinc-800/80 bg-zinc-900 flex items-center justify-center text-[9px] text-zinc-600 font-mono">
                  COMIC
                </div>
              )}
            </Link>
          ))
        )}
      </div>

      {/* 4. Bottom Callout: View all notifications > (matching screenshot) */}
      <div className="border-t border-zinc-800/60 p-2.5 bg-[#14161b] text-center">
        <Link
          href="/bookmarks"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors py-1 cursor-pointer group"
        >
          <span>View all notifications</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
