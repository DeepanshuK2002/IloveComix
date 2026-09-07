"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, MoreHorizontal, ExternalLink, Compass } from "lucide-react";
import type { SearchResult } from "@/lib/types";
import { toHighResCoverUrl } from "@/lib/mangadex";
import { CONTENT_LANGUAGES, getUserSettings, saveUserSettings } from "@/lib/settings";

interface HeroCarouselProps {
  items: SearchResult[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState(() => getUserSettings().language);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const total = items.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer with pause-on-hover
  useEffect(() => {
    if (total <= 1 || isHovered) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [total, isHovered, nextSlide]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const wallpaperUrl = currentItem.bannerUrl || null;
  const highResCover = toHighResCoverUrl(currentItem.coverUrl) || currentItem.coverUrl || "";
  const displayArtwork = wallpaperUrl || highResCover;

  // Format type & top 2 genres
  const formatType =
    currentItem.type === "manhwa"
      ? "Webtoon"
      : currentItem.type === "manhua"
      ? "Manhua"
      : "Comic";

  const genres = currentItem.tags
    .slice(0, 2)
    .map((t) => t.name)
    .join(" • ");

  const badgeText = genres ? `${formatType} • ${genres}` : formatType;

  // Clean description text
  const cleanDescription = (desc?: string) => {
    if (!desc) return "Read this popular series with high quality panels on Ilovecomix.";
    return desc.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1").replace(/[*_~`]/g, "");
  };

  const handleLanguageChange = (nextLanguage: string) => {
    const settings = getUserSettings();
    saveUserSettings({ ...settings, language: nextLanguage });
    setLanguage(nextLanguage);
    setIsMenuOpen(false);
    router.refresh();
  };

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Hero Card Container with mix of white and red in light mode, deep dark in dark mode */}
      <div
        className="relative h-[320px] sm:h-[360px] md:h-[390px] w-full rounded-3xl overflow-hidden border border-red-200/80 bg-gradient-to-br from-white via-[#fff5f4] to-[#fee2e2]/70 shadow-2xl shadow-red-500/10 group dark:border-white/[0.08] dark:bg-none dark:bg-[#050507] dark:shadow-black/90"
      >
        {/* Warm ambient glows in light mode for white & red mix */}
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-red-400/15 blur-3xl pointer-events-none dark:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-red-500/10 blur-3xl pointer-events-none dark:hidden"
          aria-hidden="true"
        />

        {/* Artwork Pop Backplate: Vibrant radiant backlight to make character art pop in light mode */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-3/4 sm:w-3/5 h-full bg-[radial-gradient(ellipse_at_65%_50%,rgba(255,69,58,0.24)_0%,rgba(223,48,28,0.12)_45%,transparent_75%)] blur-2xl pointer-events-none dark:hidden"
          aria-hidden="true"
        />

        {/* Background Ambient Glow & Diffused Artwork Light */}
        {displayArtwork && (
          <div
            key={`glow-${currentItem.id}`}
            className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl opacity-35 saturate-150 dark:opacity-20 dark:saturate-100 transition-all duration-1000 pointer-events-none"
            style={{ backgroundImage: `url(${displayArtwork})` }}
          />
        )}

        {/* Character Illustration / Horizontal Wallpaper Banner */}
        {wallpaperUrl ? (
          /* True Horizontal Wallpaper Cover spanning the entire hero banner */
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <div className="relative w-full h-full">
              <Image
                key={`banner-${currentItem.id}`}
                src={wallpaperUrl}
                alt={currentItem.title}
                fill
                priority
                unoptimized
                className="object-cover object-center sm:object-[center_35%] transition-all duration-700 ease-out animate-in fade-in zoom-in-95 group-hover:scale-105 contrast-[1.04] saturate-[1.10] brightness-[1.01] dark:contrast-100 dark:saturate-100 dark:brightness-100"
              />
              {/* Left-to-right fade overlay so content is readable on left, letting horizontal wallpaper shine across center and right */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#fff5f4] via-[#fff5f4]/95 via-35% md:via-42% to-[#fff5f4]/30 to-75% sm:to-transparent hidden sm:block dark:from-[#050507] dark:via-[#050507]/90 dark:via-35% dark:md:via-42% dark:to-[#050507]/20 dark:to-75% dark:sm:to-transparent" />
              {/* Mobile bottom-to-top gradient for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#fff5f4] via-[#fff5f4]/85 via-50% to-transparent sm:hidden dark:from-[#050507] dark:via-[#050507]/85 dark:via-50% dark:to-transparent" />
              {/* Subtle top & bottom edge vignette */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 dark:from-black/40 dark:via-transparent dark:to-black/60" />
            </div>
          </div>
        ) : highResCover ? (
          /* Fallback Vertical Cover Art on Right Side */
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 md:w-3/5 lg:w-7/12 h-full z-0 overflow-hidden pointer-events-none">
            <div className="relative w-full h-full">
              <Image
                key={`art-${currentItem.id}`}
                src={highResCover}
                alt={currentItem.title}
                fill
                priority
                unoptimized
                className="object-cover object-top sm:object-center transition-all duration-700 ease-out animate-in fade-in zoom-in-95 group-hover:scale-105 contrast-[1.06] saturate-[1.12] brightness-[1.01] dark:contrast-100 dark:saturate-100 dark:brightness-100"
              />
              {/* Left-to-right fade ONLY at the transition boundary, leaving the illustration vivid and crystal clear */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#fff5f4] via-[#fff5f4]/70 via-15% to-transparent to-45% hidden sm:block dark:from-[#050507] dark:via-[#050507]/60 dark:via-35% dark:to-transparent" />
              {/* Subtle bottom fade only on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#fff5f4]/80 via-transparent via-25% to-transparent sm:from-transparent dark:from-[#050507] dark:via-[#050507]/80 dark:via-30% dark:sm:from-[#050507] dark:sm:via-[#050507]/35" />
              {/* Subtle top fade (dark mode only) */}
              <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-[#050507]/60 dark:via-transparent dark:to-transparent" />
            </div>
          </div>
        ) : null}

        {/* Readability gradient over left panel for fallback vertical cover */}
        {!wallpaperUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#fff5f4] via-[#fff5f4]/90 via-50% to-transparent sm:bg-gradient-to-r sm:from-[#fff5f4] sm:via-[#fff5f4]/90 sm:via-35% sm:to-transparent sm:to-60% dark:from-[#050507] dark:via-[#050507]/85 dark:to-[#050507]/30 dark:sm:from-[#050507] dark:sm:via-[#050507]/90 dark:sm:to-transparent z-10 pointer-events-none" />
        )}

        {/* Content Overlay */}
        <div className="relative z-20 h-full flex flex-col justify-between p-5 sm:p-7 md:p-9 max-w-xl lg:max-w-2xl">
          {/* Top category / spotlight pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#DF301C] border border-red-200/80 shadow-xs dark:bg-white/[0.06] dark:text-zinc-300 dark:border-white/10 dark:shadow-sm">
              <Sparkles className="h-3 w-3 text-[#DF301C] dark:text-amber-400" />
              Featured Spotlight
            </span>
          </div>

          {/* Center Story Metadata */}
          <div className="space-y-2 sm:space-y-2.5 my-auto">
            {/* Title (reduced size & font weight) */}
            <Link href={`/manga/${currentItem.id}`} className="block group/title">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-zinc-900 group-hover/title:text-[#DF301C] transition-colors drop-shadow-xs line-clamp-1 sm:line-clamp-2 dark:text-white dark:drop-shadow-md">
                {currentItem.title}
              </h1>
            </Link>

            {/* Subtitle / Description (strictly 2 lines) */}
            <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed max-w-md dark:text-zinc-300/90 dark:drop-shadow">
              {cleanDescription(currentItem.description)}
            </p>

            {/* Badges Row: New Style Pulse Badge + Comic/Genre Pill */}
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {/* Sleek Pulse NEW Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DF301C] border border-[#DF301C] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white shadow-sm shadow-[#DF301C]/30 backdrop-blur-md dark:bg-[#DF301C]/20 dark:border-[#DF301C]/40 dark:text-[#ff7163] dark:shadow-[#DF301C]/25">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75 dark:bg-[#DF301C]" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white dark:bg-[#DF301C]" />
                </span>
                NEW
              </span>

              <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] sm:text-xs font-medium text-zinc-700 border border-red-200/70 shadow-xs dark:bg-white/10 dark:text-zinc-200 dark:border-white/15 dark:shadow-sm">
                {badgeText}
              </span>
            </div>

            {/* Action Ghost Outline Button */}
            <div className="pt-1">
              <Link
                href={`/manga/${currentItem.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DF301C] bg-[#DF301C] hover:bg-[#c72016] text-white font-semibold text-xs sm:text-sm px-4 py-1.5 sm:px-5 sm:py-2 transition-all duration-200 active:scale-95 shadow-md shadow-[#DF301C]/25 group/btn dark:border-white/25 dark:hover:border-[#DF301C] dark:bg-white/[0.04] dark:hover:bg-[#DF301C]/15 dark:text-white dark:shadow-sm"
              >
                <span>Read Now</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Bottom Left Navigation Controller: Dots Pagination */}
          <div className="pt-2 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 border border-red-200/80 shadow-md select-none dark:bg-[#050507]/80 dark:border-white/15 dark:shadow-xl">
              <button
                type="button"
                onClick={prevSlide}
                className="p-1 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-red-50 transition-colors cursor-pointer active:scale-90 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {/* Dots indicator */}
              <div className="flex items-center gap-1.5 px-1.5">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === currentIndex
                        ? "w-5 h-1.5 bg-[#DF301C] shadow-sm shadow-[#DF301C]/50"
                        : "w-1.5 h-1.5 bg-red-200 hover:bg-red-300 dark:bg-white/30 dark:hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextSlide}
                className="p-1 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-red-50 transition-colors cursor-pointer active:scale-90 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/20"
                aria-label="Next slide"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className={`p-1 rounded-full transition-colors cursor-pointer active:scale-90 ${
                    isMenuOpen
                      ? "bg-red-100 text-[#DF301C] dark:bg-white/20 dark:text-white"
                      : "text-zinc-600 hover:bg-red-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/20 dark:hover:text-white"
                  }`}
                  aria-label="More options"
                  aria-expanded={isMenuOpen}
                  title="More options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>

                {isMenuOpen && (
                  <div
                    className="absolute right-0 bottom-full mb-1.5 w-52 rounded-xl border border-red-100 bg-white/95 backdrop-blur-xl shadow-2xl p-1 z-50 text-left dark:border-zinc-800/90 dark:bg-[#16181d]/95"
                    role="menu"
                  >
                    <label className="block px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Chapter language
                    </label>
                    <select
                      value={language}
                      onChange={(event) => handleLanguageChange(event.target.value)}
                      className="mx-2 mb-1 w-[calc(100%-1rem)] rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 outline-none focus:border-[#DF301C] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                      aria-label="Chapter language"
                    >
                      {CONTENT_LANGUAGES.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                    <Link
                      href={`/manga/${currentItem.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:text-[#DF301C] hover:bg-red-50/70 transition-colors dark:text-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800/70"
                      role="menuitem"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#DF301C] transition-colors dark:group-hover:text-zinc-200" />
                      <span>View title</span>
                    </Link>
                    <Link
                      href="/browse"
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:text-[#DF301C] hover:bg-red-50/70 transition-colors dark:text-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800/70"
                      role="menuitem"
                    >
                      <Compass className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#DF301C] transition-colors dark:group-hover:text-zinc-200" />
                      <span>Browse comics</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Link on mobile */}
            <Link
              href="/browse"
              className="text-xs font-mono text-zinc-600 hover:text-[#DF301C] transition-colors sm:hidden dark:text-zinc-400 dark:hover:text-white"
            >
              Explore all →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
