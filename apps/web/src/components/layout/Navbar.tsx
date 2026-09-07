"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Compass,
  Bookmark,
  History,
  Settings as SettingsIcon,
  Filter,
  Bell,
  TrendingUp,
  BookOpen,
  Globe,
  Users,
  Trophy,
  Layers,
  ChevronRight,
  User,
  Moon,
  Sun,
  Star,
  LibraryBig,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Logo } from "./Logo";
import { useSearchModal } from "@/components/search/SearchModalContext";
import { useNotifications } from "@/components/notification/NotificationProvider";
import { NotificationPanel } from "@/components/notification/NotificationPanel";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useUser } from "@/components/user/UserProvider";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { openSearch } = useSearchModal();
  const { unreadCount } = useNotifications();
  const { profile } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    if (isDropdownOpen || isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isNotifOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pathname?.startsWith("/read")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-md"
            aria-label="Ilovecomix Home"
          >
            <Logo priority className="h-8 w-auto object-contain" />
          </Link>

          {/* Search Bar Button that opens Modal (visible on sm and larger) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => openSearch()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openSearch();
              }
            }}
            className="hidden sm:block flex-1 max-w-md sm:max-w-lg mx-2 group text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-lg"
            aria-label="Search any title"
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 group-hover:text-zinc-300 transition-colors"
                aria-hidden="true"
              />
              <div className="w-full rounded-lg border border-zinc-800/90 bg-zinc-950/70 py-1.5 pl-8 pr-2.5 text-xs text-zinc-500 group-hover:border-zinc-700 group-hover:text-zinc-300 transition-colors flex items-center select-none justify-between gap-2">
                <span className="truncate">Search any title…</span>
                <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono text-zinc-500 bg-zinc-900/80 border border-zinc-800 rounded px-1.5 py-0.5 shrink-0">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Action Icons & Dropdown Trigger (matching screenshot) */}
          <div ref={dropdownRef} className="relative flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Icon Button (replaces search bar on small screen) */}
            <button
              type="button"
              onClick={() => openSearch()}
              className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 cursor-pointer"
              title="Search"
              aria-label="Search any title"
            >
              <Search className="h-4 w-4" />
            </button>
            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 cursor-pointer"
              title="Filter"
              aria-label="Filter"
            >
              <Filter className="h-4 w-4" />
            </button>

            {/* Notification Bell with working dropdown */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotifOpen((prev) => !prev);
                  setIsDropdownOpen(false);
                }}
                className={`relative p-2 rounded-lg transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 ${
                  isNotifOpen
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={isNotifOpen}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#DF301C] ring-2 ring-black" />
                )}
              </button>

              {isNotifOpen && (
                <NotificationPanel onClose={() => setIsNotifOpen(false)} />
              )}
            </div>

            {/* User Avatar Circle (matching screenshot) */}
            <Link
              href="/profile"
              className="flex items-center gap-1.5 p-1 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400"
              title={profile.username || "Profile"}
              aria-label="Profile"
            >
              <div className="relative h-7 w-7 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 shadow-sm flex items-center justify-center">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.username}
                    fill
                    sizes="28px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                )}
              </div>
            </Link>

            {/* Menu Dropdown Toggle Button (Right 3-line hamburger) */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`p-2 rounded-lg transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 cursor-pointer ${
                isDropdownOpen
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
              title="Menu"
              aria-label="Toggle navigation menu"
              aria-expanded={isDropdownOpen}
            >
              {isDropdownOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {/* Top Dropdown Menu (matching screenshot) */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-2xl border border-zinc-800/90 bg-[#16181d]/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left"
                role="menu"
                aria-orientation="vertical"
              >
                {/* 1. TOP SECTION: Browse, Bookmarks & History */}
                <div className="space-y-0.5">
                  <Link
                    href="/browse"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <Compass className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    <span>Browse</span>
                  </Link>

                  <Link
                    href="/bookmarks"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <Bookmark className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    <span>Bookmarks</span>
                  </Link>

                  <Link
                    href="/history"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <History className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    <span>History</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="my-1.5 border-t border-zinc-800/80" />

                {/* 2. CATEGORIES / BROWSE HEADER */}
                <p className="px-3 pt-1 pb-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                  BROWSE
                </p>

                {/* 3. CATEGORIES LIST (matching screenshot) */}
                <div className="space-y-0.5">
                  <Link
                    href="/browse?type=manhwa"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200" />
                    <span>Trending Webtoon</span>
                  </Link>

                  <Link
                    href="/browse?type=manga"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200" />
                    <span>Trending Manga</span>
                  </Link>

                  <Link
                    href="/browse"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <Globe className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200" />
                    <span>Popular Genres</span>
                  </Link>

                  <Link
                    href="/browse?order=followedCount"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200" />
                    <span>Popular Groups</span>
                  </Link>

                  <Link
                    href="/browse?order=rating"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <Star className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    <span>Popular Titles</span>
                  </Link>

                  <Link
                    href="/browse"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <Users className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200" />
                    <span>Groups</span>
                  </Link>

                  <Link
                    href="/bookmarks"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <Layers className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200" />
                    <span>Collections</span>
                  </Link>
                </div>

                {/* Divider + Comix section */}
                <div className="my-1.5 border-t border-zinc-800/80" />
                <p className="px-3 pt-1 pb-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                  COMIX (UNOFFICIAL API)
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/comix"
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <LibraryBig className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200" />
                    <span>Comix Catalogue</span>
                  </Link>
                </div>

                {/* 4. THEME SELECTOR in Top Dropdown */}
                <div className="mt-1 pt-2 pb-1 px-3 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                      {theme === "dark" ? (
                        <Moon className="h-3.5 w-3.5 text-[#DF301C]" />
                      ) : (
                        <Sun className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      <span>Theme</span>
                    </span>
                    <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-xl border border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          theme === "dark"
                            ? "bg-zinc-800 text-[#DF301C] shadow-sm border border-zinc-700/60"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <Moon className="h-3 w-3" />
                        <span>Dark</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          theme === "light"
                            ? "bg-zinc-200 text-zinc-900 shadow-sm border border-zinc-300"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <Sun className="h-3 w-3" />
                        <span>Light</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. BOTTOM CONTAINER: Browse all titles (as in screenshot) */}
                <div className="mt-1 pt-1.5 border-t border-zinc-800/60">
                  <Link
                    href="/browse"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/40 text-xs font-semibold text-zinc-200 hover:text-white transition-all group"
                  >
                    <span>Browse all titles</span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal (matching screenshot) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </nav>
  );
}
