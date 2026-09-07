"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Check } from "lucide-react";
import {
  useNotifications,
  type NotificationTab,
} from "@/components/notification/NotificationProvider";

export function NotificationsTab() {
  const {
    notifications,
    unreadCount,
    comicsUnreadCount,
    communityUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<NotificationTab>("comics");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = notifications.filter((n) => {
    if (n.tab !== activeTab) return false;
    if (filter === "unread" && n.read) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Notifications
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread total.` : "All caught up."}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Tabs & Filter row (matching Screenshot 212633) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#14161b] rounded-xl border border-zinc-800/80 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("comics")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "comics"
                ? "bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/40 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Comics</span>
            {comicsUnreadCount > 0 && (
              <span className="bg-[#DF301C] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                {comicsUnreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("community")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "community"
                ? "bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/40 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Community</span>
            {communityUnreadCount > 0 && (
              <span className="bg-[#DF301C] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                {communityUnreadCount}
              </span>
            )}
          </button>
        </div>

        {/* All vs Unread Filter */}
        <div className="flex items-center p-0.5 rounded-lg border border-zinc-800 bg-[#14161b] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
              filter === "all"
                ? "bg-zinc-800 text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
              filter === "unread"
                ? "bg-zinc-800 text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Notifications List (matching Screenshot 212633) */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/70 p-12 text-center text-zinc-500 text-xs">
            No notifications in this view.
          </div>
        ) : (
          filtered.map((item) => (
            <Link
              key={item.id}
              href={item.comicId ? `/manga/${item.comicId}` : "/browse"}
              onClick={() => markAsRead(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800/80 bg-[#16181d]/80 hover:bg-[#1b1d24] hover:border-zinc-700 transition-all group ${
                !item.read ? "border-l-4 border-l-[#DF301C]" : ""
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-9 w-9 rounded-full bg-[#DF301C]/15 flex items-center justify-center text-[#DF301C] shrink-0 shadow-sm">
                  <Bell className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-[#DF301C] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    {item.timeAgo}
                    {item.chapter ? ` · Ch.${item.chapter}` : ""}
                  </p>
                  {item.message && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {item.message}
                    </p>
                  )}
                </div>
              </div>

              {item.coverUrl && (
                <div className="relative h-14 w-10 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 shadow-sm ml-3">
                  <Image
                    src={item.coverUrl}
                    alt={item.title}
                    fill
                    sizes="40px"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    unoptimized
                  />
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
