"use client";

import {
  User,
  Bookmark,
  Users,
  Shield,
  Clock,
  Layers,
  Rss,
  Bell,
  MessageSquare,
  Upload,
  ArrowUpDown,
  Settings,
} from "lucide-react";

export type ProfileTab =
  | "edit-profile"
  | "following-titles"
  | "following-users"
  | "following-groups"
  | "read-history"
  | "collections"
  | "feed"
  | "notifications"
  | "comments"
  | "uploaded-chapters"
  | "import-export"
  | "settings";

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const SIDEBAR_ITEMS: { id: ProfileTab; label: string; icon: any }[] = [
  { id: "edit-profile", label: "Edit Profile", icon: User },
  { id: "following-titles", label: "Following Titles", icon: Bookmark },
  { id: "following-users", label: "Following Users", icon: Users },
  { id: "following-groups", label: "Following Groups", icon: Shield },
  { id: "read-history", label: "Read History", icon: Clock },
  { id: "collections", label: "Collections", icon: Layers },
  { id: "feed", label: "Feed", icon: Rss },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "uploaded-chapters", label: "Uploaded Chapters", icon: Upload },
  { id: "import-export", label: "Import / Export", icon: ArrowUpDown },
  { id: "settings", label: "Settings", icon: Settings },
];

export function ProfileSidebar({
  activeTab,
  onTabChange,
}: ProfileSidebarProps) {
  return (
    <aside className="w-full lg:w-60 shrink-0">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 custom-scrollbar">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-zinc-800/90 text-white font-semibold border border-zinc-700/60 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-850"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-[#DF301C]" : "text-zinc-400"
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
