"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";

const HISTORY_ITEMS = [
  {
    id: "milf-hunter",
    title: "MILF Hunter in Another World",
    readChapter: "1",
    totalChapters: "133",
    timeAgo: "29m ago",
    percent: 1,
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
  },
  {
    id: "wall-street",
    title: "The Wall Street Genius's Final Investment Playbook",
    readChapter: "1",
    totalChapters: "6",
    timeAgo: "48m ago",
    percent: 16,
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
  },
  {
    id: "s-class-hunters",
    title: "My S-Class Hunters",
    readChapter: "175",
    totalChapters: "180",
    timeAgo: "1h ago",
    percent: 97,
    coverUrl:
      "https://uploads.mangadex.org/covers/b16f47a2-0a01-41d2-b90d-76367cb28459/3bf77248-33d2-410a-bfcd-e864c1860388.png.256.jpg",
  },
  {
    id: "affair-agency",
    title: "Affair Agency",
    readChapter: "14",
    totalChapters: "14",
    timeAgo: "1h ago",
    completed: true,
    coverUrl:
      "https://uploads.mangadex.org/covers/0118e4d2-2dd8-44eb-8a42-0f8d53e809c4/35816bfa-d0c7-4480-b733-2c5b2984a04d.jpg.256.jpg",
  },
  {
    id: "intro-milfs",
    title: "An Introduction to MILFs",
    readChapter: "82",
    totalChapters: "91",
    timeAgo: "1h ago",
    completed: true,
    coverUrl:
      "https://uploads.mangadex.org/covers/493eee8e-2f7a-49fa-94e3-8ac164e5718a/504cac40-f9b6-436f-af7d-ebaff7c594b1.jpg.256.jpg",
  },
  {
    id: "divine-beasts",
    title: "Kindergarten for Divine Beasts",
    readChapter: "78",
    totalChapters: "78",
    timeAgo: "1d ago",
    completed: true,
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
  },
  {
    id: "searching-daddy",
    title: "Secretly Strong and Searching for My Daddy",
    readChapter: "49",
    totalChapters: "49",
    timeAgo: "1d ago",
    completed: true,
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
  },
  {
    id: "baby-sprout",
    title: "The Baby Sprout Who Bloomed in the Villain Duke's Family",
    readChapter: "18",
    totalChapters: "19",
    timeAgo: "1d ago",
    completed: true,
    coverUrl:
      "https://uploads.mangadex.org/covers/b16f47a2-0a01-41d2-b90d-76367cb28459/3bf77248-33d2-410a-bfcd-e864c1860388.png.256.jpg",
  },
  {
    id: "retired-countryside",
    title: "I Retired to the Countryside, and National-Level Big Shots Won't Leave Me Alone",
    readChapter: "1",
    totalChapters: "7",
    timeAgo: "1d ago",
    percent: 14,
    coverUrl:
      "https://uploads.mangadex.org/covers/f2d8a9aa-3617-4034-91bf-05c494fd7516/12862eb8-be46-4236-ba6c-a5ae5fe9b33c.jpg.256.jpg",
  },
  {
    id: "prologue-30",
    title: "30 Years Have Passed Since the Prologue",
    readChapter: "14",
    totalChapters: "14",
    timeAgo: "4d ago",
    completed: true,
    coverUrl:
      "https://uploads.mangadex.org/covers/0118e4d2-2dd8-44eb-8a42-0f8d53e809c4/35816bfa-d0c7-4480-b733-2c5b2984a04d.jpg.256.jpg",
  },
  {
    id: "back-to-chanbi",
    title: "Back to Chanbi",
    readChapter: "56",
    totalChapters: "182",
    timeAgo: "5d ago",
    percent: 31,
    coverUrl:
      "https://uploads.mangadex.org/covers/493eee8e-2f7a-49fa-94e3-8ac164e5718a/504cac40-f9b6-436f-af7d-ebaff7c594b1.jpg.256.jpg",
  },
  {
    id: "calypso-can",
    title: "'Cause Calypso Can",
    readChapter: "1",
    totalChapters: "118",
    timeAgo: "5d ago",
    percent: 1,
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
  },
];

import { useUser } from "@/components/user/UserProvider";

export function ReadHistoryTab() {
  const { history } = useUser();
  const [currentPage, setCurrentPage] = useState(1);

  const displayList = history && history.length > 0 ? history : HISTORY_ITEMS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Read History
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Resume where you left off. {Math.max(65, displayList.length)} chapters logged.
        </p>
      </div>

      {/* 2-Column Grid (matching Screenshot 212601) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {displayList.map((item: any) => (
          <Link
            key={item.id}
            href={`/manga/${item.comicId || item.id}`}
            className="flex items-center justify-between p-3 rounded-2xl border border-zinc-800/80 bg-[#16181d]/80 hover:bg-[#1b1d24] hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative h-14 w-11 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 shadow-sm">
                <Image
                  src={item.coverUrl}
                  alt={item.title}
                  fill
                  sizes="44px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  unoptimized
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-[#DF301C] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mt-1">
                  <span>📖 {item.readChapter} / {item.totalChapters}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-500">{item.timeAgo}</span>
                </div>
              </div>
            </div>

            {/* Right: Progress ring or checkmark */}
            <div className="ml-3 shrink-0">
              {item.completed ? (
                <div className="h-6 w-6 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full border border-zinc-700/80 flex items-center justify-center text-[10px] font-mono text-zinc-400">
                  {item.percent}%
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-1.5 pt-4">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => setCurrentPage(page)}
            className={`h-8 w-8 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              currentPage === page
                ? "bg-zinc-800 text-white font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-850"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
