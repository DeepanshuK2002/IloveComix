"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MoreHorizontal, ExternalLink, Compass, Eye, Minimize2, Maximize2, RefreshCw } from "lucide-react";

export interface RailItem {
  id: string;
  title: string;
  coverUrl?: string | null;
  href?: string;
  external?: boolean;
  chapter?: string;
  timeAgo?: string;
  rank?: number;
  progress?: string;
  progressPercent?: number;
  badgeLabel?: string;
  translatedLanguage?: string;
}

function RailLink({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return <Link href={href} className={className}>{children}</Link>;
}

function CircleProgress({ percent }: { percent: number }) {
  const radius = 12.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="relative h-8 w-8 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 rounded-full bg-black/90 backdrop-blur-md shadow-lg" />
      <svg className="h-8 w-8 -rotate-90 transform" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke="#818cf8"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-[8.5px] font-mono font-bold text-white tracking-tighter">
        {percent}%
      </span>
    </div>
  );
}

const calculatePercent = (progressStr?: string, percentVal?: number) => {
  if (percentVal !== undefined) return percentVal;
  if (!progressStr) return 100;
  const parts = progressStr.split("/").map((p) => parseFloat(p.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > 0) {
    return Math.min(100, Math.max(0, Math.round((parts[0] / parts[1]) * 100)));
  }
  return 100;
};

interface HomeFeedRailProps {
  title: string;
  items: RailItem[];
  tabs?: { label: string; value: string }[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  infoHref?: string;
  emptyMessage?: string;
  headerActions?: React.ReactNode;
  onRefresh?: () => void;
  extraMenuItems?: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  hideBrowseRefresh?: boolean;
  loading?: boolean;
}

export function HomeFeedRail({
  title,
  items,
  tabs,
  activeTab,
  onTabChange,
  infoHref,
  emptyMessage = "No titles available yet.",
  headerActions,
  onRefresh,
  extraMenuItems,
  hideBrowseRefresh = false,
  loading = false,
}: HomeFeedRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const isNewChapters =
    title.toLowerCase().includes("new chapter") ||
    title.toLowerCase().includes("new chapters");

  useEffect(() => {
    try {
      const key = `ilovecomix-rail-minimized-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      const val = localStorage.getItem(key);
      if (val !== null) setIsMinimized(val === "true");
    } catch {}
  }, [title]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const toggleMinimize = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        const key = `ilovecomix-rail-minimized-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
        localStorage.setItem(key, String(next));
      } catch {}
      return next;
    });
    setIsMenuOpen(false);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -480, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 480, behavior: "smooth" });
    }
  };

  return (
    <section className={isMinimized ? "mb-4" : "mb-8"}>
      {/* Header Row (matching screenshot layout) */}
      <div className={`flex items-center justify-between gap-2 ${isMinimized ? "mb-1" : "mb-3.5"}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {isMinimized && (
              <span
                role="button"
                tabIndex={0}
                onClick={toggleMinimize}
                title="Click to expand"
                className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 cursor-pointer hover:text-zinc-200 transition-colors"
              >
                Minimized
              </span>
            )}
          </h2>

          {/* Optional Tabs like [Hot] [New] in Latest Updates */}
          {tabs && tabs.length > 0 && !isMinimized && (
            <div className="flex items-center gap-1 bg-[#14161b] p-0.5 rounded-lg border border-zinc-800/80">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => onTabChange?.(tab.value)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {headerActions && !isMinimized && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}

          {loading && !isMinimized && (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-500" aria-hidden="true" />
          )}
        </div>

        {/* Right Controls: < > ••• (slide left, slide right, 3-dot dropdown more button) */}
        <div className="flex items-center gap-1 shrink-0">
          {!isMinimized && (
            <>
              <button
                type="button"
                onClick={scrollLeft}
                className="h-6 w-6 rounded border border-zinc-800/80 bg-[#16181d] hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                aria-label="Slide left"
                title="Slide left"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="h-6 w-6 rounded border border-zinc-800/80 bg-[#16181d] hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                aria-label="Slide right"
                title="Slide right"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {/* 3-Dot Dropdown More Button */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`h-6 w-6 rounded border transition-colors flex items-center justify-center cursor-pointer active:scale-95 ${
                isMenuOpen
                  ? "border-zinc-700 bg-zinc-800 text-white"
                  : "border-zinc-800/80 bg-[#16181d] hover:bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
              title="More options"
              aria-label="More options"
              aria-expanded={isMenuOpen}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

             {isMenuOpen && (
               <div
                 className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-zinc-800/90 bg-[#16181d]/95 backdrop-blur-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                 role="menu"
               >
                 {infoHref && (
                   <Link
                     href={infoHref}
                     onClick={() => setIsMenuOpen(false)}
                     className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors"
                     role="menuitem"
                   >
                     <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                     <span>View all</span>
                   </Link>
                 )}

                 {extraMenuItems && (
                   <div className="px-1 py-1 space-y-0.5">
                     {typeof extraMenuItems === "function"
                       ? extraMenuItems(() => setIsMenuOpen(false))
                       : extraMenuItems}
                   </div>
                 )}

                 {infoHref && extraMenuItems && (
                   <div className="h-px bg-zinc-800/80 mx-1 my-1" />
                 )}

                 {/* Minimize / Expand option */}
                 <button
                   type="button"
                   onClick={toggleMinimize}
                   className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors cursor-pointer text-left"
                   role="menuitem"
                 >
                   {isMinimized ? (
                     <>
                       <Maximize2 className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                       <span>Expand</span>
                     </>
                   ) : (
                     <>
                       <Minimize2 className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                       <span>Minimize</span>
                     </>
                   )}
                 </button>

                 {!isNewChapters && !hideBrowseRefresh && (
                   <>
                     <Link
                       href="/browse"
                       onClick={() => setIsMenuOpen(false)}
                       className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors"
                       role="menuitem"
                     >
                       <Compass className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                       <span>Browse comics</span>
                     </Link>
                     <button
                       type="button"
                       onClick={() => {
                         onRefresh?.();
                         setIsMenuOpen(false);
                       }}
                       className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors cursor-pointer text-left"
                       role="menuitem"
                     >
                       <RefreshCw className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                       <span>Refresh</span>
                     </button>
                   </>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Cards Scroll Container (hidden when minimized) */}
      {isMinimized ? null : (
        items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0e1017]/60 p-8 text-center text-xs text-zinc-500">
            {emptyMessage}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex items-start gap-3.5 sm:gap-4 overflow-x-auto pb-1 no-scrollbar scrollbar-none snap-x snap-mandatory"
          >
            {items.map((item, idx) => {
              const itemHref = item.href || `/manga/${item.id}`;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="w-[155px] sm:w-[175px] md:w-[190px] shrink-0 snap-start group"
                >
                {/* Poster Artwork with Badges */}
                <RailLink
                  href={itemHref}
                  external={item.external}
                  className="block relative aspect-[3/4.2] w-full rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-md group-hover:border-zinc-700 transition-all"
                >
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={item.title}
                      fill
                      sizes="220px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-mono text-zinc-600">
                      No Cover
                    </div>
                  )}

                  {/* Top-Left Rank Badge if provided */}
                  {item.rank !== undefined && (
                    <div className="absolute top-1.5 left-1.5 rounded-md bg-black/80 backdrop-blur-md px-2 py-0.5 text-[11px] font-mono font-bold text-white border border-white/10 shadow">
                      #{item.rank}
                    </div>
                  )}

                  {/* Circular Reading Progress Badge at Bottom Right (matching screenshot 012015.png) */}
                  {item.progress && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <CircleProgress
                        percent={calculatePercent(item.progress, item.progressPercent)}
                      />
                    </div>
                  )}

                  {/* Bottom Left Chapter Badge */}
                  {!item.progress && item.badgeLabel && (
                    <div className="absolute bottom-1.5 left-1.5">
                      <span className="rounded bg-black/85 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-white border border-white/10">
                        {item.badgeLabel}
                      </span>
                    </div>
                  )}
                </RailLink>

                {/* Sub-row: Eye progress for Reading History or Chapter & Time for other rails */}
                {item.progress ? (
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-zinc-400 mt-2 px-0.5">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Eye className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{item.progress}</span>
                    </div>
                    <span className="text-zinc-500 shrink-0 text-[10px] sm:text-[11px]">
                      {item.timeAgo || "Recently"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-zinc-400 mt-2 px-0.5">
                    <span className="truncate">{item.chapter || "Ch.1"}</span>
                    <span className="text-zinc-500 shrink-0 text-[10px] sm:text-[11px]">
                      {item.timeAgo || "Recently"}
                    </span>
                  </div>
                )}

                {/* Title */}
                <RailLink
                  href={itemHref}
                  external={item.external}
                  className={`block mt-1 ${item.progress ? "text-center" : ""}`}
                >
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-[#DF301C] line-clamp-1 truncate leading-snug transition-colors">
                    {item.title}
                  </h3>
                </RailLink>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
