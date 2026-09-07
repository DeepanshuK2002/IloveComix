"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Smartphone, MessageSquare, ChevronRight } from "lucide-react";
import type { SearchResult } from "@/lib/types";

interface HomeSidebarProps {
  recentlyAdded: SearchResult[];
  completedSeries?: SearchResult[];
}

export function HomeSidebar({
  recentlyAdded,
  completedSeries = [],
}: HomeSidebarProps) {
  const [sidebarTab, setSidebarTab] = useState<"recent" | "completed">("recent");

  const displayList = sidebarTab === "recent" ? recentlyAdded : completedSeries;

  return (
    <aside className="space-y-6">
      {/* 1 & 2. Install PWA & Join Discord Community in the Same Border Box */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/80 overflow-hidden shadow-sm divide-y divide-zinc-800/60">
        {/* Install PWA */}
        <div className="flex items-center justify-between p-3.5 hover:bg-[#1b1d24] transition-all cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">
                Install PWA
              </h4>
              <p className="text-[11px] text-zinc-400">
                Install app for iOS & Android
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </div>

        {/* Join Discord Community */}
        <a
          href="https://discord.gg"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 hover:bg-[#1b1d24] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/15 border border-indigo-600/25 text-indigo-400 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">
                Join Discord Community
              </h4>
              <p className="text-[11px] text-zinc-400">
                chat with other comix users
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      {/* 3. Recently Added / Complete Series (matching screenshot) */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/80 p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3 mb-3">
          <button
            type="button"
            onClick={() => setSidebarTab("recent")}
            className={`text-xs font-bold transition-colors cursor-pointer ${
              sidebarTab === "recent"
                ? "text-zinc-100 border-b-2 border-[#DF301C] -mb-3 pb-3"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Recently Added
          </button>
          <span className="text-zinc-600 text-xs">/</span>
          <button
            type="button"
            onClick={() => setSidebarTab("completed")}
            className={`text-xs font-bold transition-colors cursor-pointer ${
              sidebarTab === "completed"
                ? "text-zinc-100 border-b-2 border-[#DF301C] -mb-3 pb-3"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Complete Series
          </button>
        </div>

        {/* Vertical list of items (Enlarged Cards) */}
        <div className="space-y-2">
          {displayList.slice(0, 10).map((manga) => {
            const formatTag = manga.type === "manhwa" ? "MANHWA" : "MANGA";
            return (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="flex items-center gap-3.5 p-2 -mx-2 rounded-xl hover:bg-zinc-800/40 transition-colors group"
              >
                {/* Enlarged Cover Poster */}
                <div className="relative h-[84px] w-[58px] rounded-xl overflow-hidden shrink-0 border border-zinc-800/90 bg-zinc-900 shadow-md group-hover:border-zinc-700 transition-colors">
                  {manga.coverUrl ? (
                    <Image
                      src={manga.coverUrl}
                      alt={manga.title}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] font-mono text-zinc-600">
                      N/A
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                    {formatTag}
                  </span>
                  <h5 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-[#DF301C] line-clamp-2 leading-snug transition-colors mt-0.5">
                    {manga.title}
                  </h5>
                  <p className="text-[11px] sm:text-xs font-mono text-zinc-400 mt-1">
                    Ch.1 · 1h ago
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-zinc-800/60 text-center">
          <Link
            href="/browse?order=createdAt"
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            View more ›
          </Link>
        </div>
      </div>
    </aside>
  );
}
