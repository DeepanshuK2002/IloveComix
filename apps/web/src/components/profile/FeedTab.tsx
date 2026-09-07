"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronsRight } from "lucide-react";

const FEED_ITEMS = [
  {
    id: "feed-1",
    title: "Kindergarten for Divine Beasts",
    chapter: "Ch.76",
    chapterTitle: "",
    group: "Vortex Scans",
    timeAgo: "7h ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
  },
  {
    id: "feed-2",
    title: "30 Years Have Passed Since the Prologue",
    chapter: "Ch.14",
    chapterTitle: "The Saintess and the Lumberjack (2)",
    group: "Flame Comics",
    timeAgo: "11h ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
  },
  {
    id: "feed-3",
    title: "Secretly Strong and Searching for My Daddy",
    chapter: "Ch.43",
    chapterTitle: "",
    group: "Luna Toons",
    timeAgo: "13h ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/b16f47a2-0a01-41d2-b90d-76367cb28459/3bf77248-33d2-410a-bfcd-e864c1860388.png.256.jpg",
  },
  {
    id: "feed-4",
    title: "30 Years Have Passed Since the Prologue",
    chapter: "Ch.13",
    chapterTitle: "The Saintess and the Lumberjack (1)",
    group: "Flame Comics",
    timeAgo: "13h ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/0118e4d2-2dd8-44eb-8a42-0f8d53e809c4/35816bfa-d0c7-4480-b733-2c5b2984a04d.jpg.256.jpg",
  },
  {
    id: "feed-5",
    title: "Secretly Strong and Searching for My Daddy",
    chapter: "Ch.45",
    chapterTitle: "",
    group: "MagusManga",
    timeAgo: "22h ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/493eee8e-2f7a-49fa-94e3-8ac164e5718a/504cac40-f9b6-436f-af7d-ebaff7c594b1.jpg.256.jpg",
  },
  {
    id: "feed-6",
    title: "Secretly Strong and Searching for My Daddy",
    chapter: "Ch.48",
    chapterTitle: "",
    group: "EZManga",
    timeAgo: "1d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/f2d8a9aa-3617-4034-91bf-05c494fd7516/12862eb8-be46-4236-ba6c-a5ae5fe9b33c.jpg.256.jpg",
  },
  {
    id: "feed-7",
    title: "Kindergarten for Divine Beasts",
    chapter: "Ch.78",
    chapterTitle: "",
    group: "KaynScan",
    timeAgo: "1d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
  },
  {
    id: "feed-8",
    title: "Secretly Strong and Searching for My Daddy",
    chapter: "Ch.48",
    chapterTitle: "",
    group: "Valir Scans",
    timeAgo: "1d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
  },
  {
    id: "feed-9",
    title: "Secretly Strong and Searching for My Daddy",
    chapter: "Ch.47",
    chapterTitle: "",
    group: "Nyx Scans",
    timeAgo: "1d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/b16f47a2-0a01-41d2-b90d-76367cb28459/3bf77248-33d2-410a-bfcd-e864c1860388.png.256.jpg",
  },
  {
    id: "feed-10",
    title: "Ultimate Shut-in",
    chapter: "Ch.84",
    chapterTitle: "",
    group: "WebToon",
    timeAgo: "1d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/493eee8e-2f7a-49fa-94e3-8ac164e5718a/504cac40-f9b6-436f-af7d-ebaff7c594b1.jpg.256.jpg",
  },
];

export function FeedTab() {
  const [subTab, setSubTab] = useState<"titles" | "groups">("titles");
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Feed</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Latest chapters from the titles and groups you follow.
        </p>
      </div>

      {/* Subtabs: Followed Titles | Followed Groups */}
      <div className="flex items-center gap-6 border-b border-zinc-800/80 pb-2">
        <button
          type="button"
          onClick={() => setSubTab("titles")}
          className={`text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            subTab === "titles"
              ? "text-white border-b-2 border-[#DF301C] pb-2 -mb-2"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Followed Titles
        </button>
        <button
          type="button"
          onClick={() => setSubTab("groups")}
          className={`text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            subTab === "groups"
              ? "text-white border-b-2 border-[#DF301C] pb-2 -mb-2"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Followed Groups
        </button>
      </div>

      {/* Feed Rows List (matching Screenshot 212617 & 212624) */}
      <div className="divide-y divide-zinc-800/40 rounded-2xl border border-zinc-800/80 bg-[#16181d]/80 overflow-hidden shadow-lg">
        {FEED_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={`/manga/${item.id}`}
            className="flex items-center justify-between gap-4 p-3.5 hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative h-12 w-9 rounded-md overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 shadow-sm">
                <Image
                  src={item.coverUrl}
                  alt={item.title}
                  fill
                  sizes="36px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  unoptimized
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-[#DF301C] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#DF301C] font-mono mt-0.5 flex items-center gap-1.5">
                  <span>{item.chapter}</span>
                  {item.chapterTitle && (
                    <span className="text-zinc-500 font-sans text-[11px] truncate">
                      {item.chapterTitle}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="block text-[11px] font-medium text-zinc-400">
                {item.group}
              </span>
              <span className="block text-[10px] font-mono text-zinc-500 mt-0.5">
                {item.timeAgo}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination (matching Screenshot 212624) */}
      <div className="flex items-center justify-center gap-1.5 pt-4">
        {[1, 2, 3, 4, 5].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPage(p)}
            className={`h-8 w-8 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              page === p
                ? "bg-zinc-800 text-white font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-850"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(5, prev + 1))}
          className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setPage(5)}
          className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
