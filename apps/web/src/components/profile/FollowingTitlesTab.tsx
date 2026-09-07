"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, Edit2, LayoutGrid, List } from "lucide-react";
import { getSavedComics, type SavedManga } from "@/lib/bookmarks";

const SEED_TITLES = [
  {
    id: "aa62f35d-fde9-46bb-a351-985b13c491c4",
    title: "Kindergarten for Divine Beasts",
    folder: "reading",
    readProgress: "78 / 78",
    timeAgo: "1d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
  },
  {
    id: "b4061c12-f107-412d-8565-978ce829c79f",
    title: "Secretly Strong and Searching for My...",
    folder: "reading",
    readProgress: "49 / 49",
    timeAgo: "1d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
  },
  {
    id: "b16f47a2-0a01-41d2-b90d-76367cb28459",
    title: "I Only Need the Duke's Child",
    folder: "reading",
    readProgress: "19 / 26.5",
    timeAgo: "1d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/b16f47a2-0a01-41d2-b90d-76367cb28459/3bf77248-33d2-410a-bfcd-e864c1860388.png.256.jpg",
  },
  {
    id: "0118e4d2-2dd8-44eb-8a42-0f8d53e809c4",
    title: "I Became A Married Man in Another World",
    folder: "reading",
    readProgress: "18 / 25",
    timeAgo: "2d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/0118e4d2-2dd8-44eb-8a42-0f8d53e809c4/35816bfa-d0c7-4480-b733-2c5b2984a04d.jpg.256.jpg",
  },
  {
    id: "493eee8e-2f7a-49fa-94e3-8ac164e5718a",
    title: "Ultimate Shut-in",
    folder: "reading",
    readProgress: "93 / 95",
    timeAgo: "4d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/493eee8e-2f7a-49fa-94e3-8ac164e5718a/504cac40-f9b6-436f-af7d-ebaff7c594b1.jpg.256.jpg",
  },
  {
    id: "prologue-30",
    title: "30 Years Have Passed Since the Prologue",
    folder: "completed",
    readProgress: "14 / 14",
    timeAgo: "4d ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
  },
  {
    id: "numbered-days",
    title: "My Numbered Days of Happiness",
    folder: "on-hold",
    readProgress: "- / 67",
    timeAgo: "1w ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/f2d8a9aa-3617-4034-91bf-05c494fd7516/12862eb8-be46-4236-ba6c-a5ae5fe9b33c.jpg.256.jpg",
  },
  {
    id: "intro-milfs",
    title: "An Introduction to MILFs",
    folder: "plan-to-read",
    readProgress: "82 / 91",
    timeAgo: "4mos ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
  },
  {
    id: "doting-father",
    title: "I Became a Doting Father",
    folder: "dropped",
    readProgress: "210 / 210",
    timeAgo: "9mos ago",
    coverUrl:
      "https://uploads.mangadex.org/covers/0118e4d2-2dd8-44eb-8a42-0f8d53e809c4/35816bfa-d0c7-4480-b733-2c5b2984a04d.jpg.256.jpg",
  },
];

const FOLDERS = [
  { id: "all", label: "All" },
  { id: "reading", label: "Reading" },
  { id: "completed", label: "Completed" },
  { id: "on-hold", label: "On-Hold" },
  { id: "plan-to-read", label: "Plan to Read" },
  { id: "dropped", label: "Dropped" },
];

export function FollowingTitlesTab() {
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"updated" | "added" | "read">(
    "updated"
  );
  const [libraryTitles, setLibraryTitles] = useState(SEED_TITLES);

  // Sync with user's saved comics
  useEffect(() => {
    const updateLibrary = () => {
      const saved = getSavedComics();
      if (saved && saved.length > 0) {
        const merged = [
          ...saved.map((item, idx) => ({
            id: item.id,
            title: item.title,
            folder: item.folder || "reading",
            readProgress: `${(idx % 20) + 1} / ${(idx % 20) + 12}`,
            timeAgo: "Recently",
            coverUrl:
              item.coverUrl ||
              "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
          })),
          ...SEED_TITLES.filter((s) => !saved.some((item) => item.id === s.id)),
        ];
        setLibraryTitles(merged);
      } else {
        setLibraryTitles(SEED_TITLES);
      }
    };

    updateLibrary();
    window.addEventListener("ilovecomix-bookmarks-changed", updateLibrary);
    window.addEventListener("ilovecomix-user-sync", updateLibrary);
    window.addEventListener("storage", updateLibrary);

    return () => {
      window.removeEventListener("ilovecomix-bookmarks-changed", updateLibrary);
      window.removeEventListener("ilovecomix-user-sync", updateLibrary);
      window.removeEventListener("storage", updateLibrary);
    };
  }, []);

  const filteredTitles = libraryTitles.filter((item) => {
    if (selectedFolder !== "all" && item.folder !== selectedFolder)
      return false;
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Following Titles
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {libraryTitles.length} titles in your library.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Edit folders</span>
        </button>
      </div>

      {/* Filter Folders Pills */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#14161b] rounded-xl border border-zinc-800/80">
        {FOLDERS.map((folder) => {
          const isActive = selectedFolder === folder.id;
          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => setSelectedFolder(folder.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-zinc-800 text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-850"
              }`}
            >
              {folder.label}
            </button>
          );
        })}
      </div>

      {/* Search & Advanced Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your library..."
            className="w-full rounded-xl border border-zinc-800 bg-[#16181d] pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-[#DF301C]/50 focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-[#16181d] hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-[11px] font-mono tracking-wider">
            ADVANCED FILTERS
          </span>
        </button>
      </div>

      {/* Sort Toolbar */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortOption("updated")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              sortOption === "updated"
                ? "bg-zinc-800 text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ↓ Recently updated
          </button>
          <button
            type="button"
            onClick={() => setSortOption("added")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              sortOption === "added"
                ? "bg-zinc-800 text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Recently added
          </button>
          <button
            type="button"
            onClick={() => setSortOption("read")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              sortOption === "read"
                ? "bg-zinc-800 text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Recently read
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 rounded-lg bg-zinc-800 text-white"
            title="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white"
            title="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Comics Grid (matching Screenshot 212533) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 pt-2">
        {filteredTitles.map((comic) => (
          <Link
            key={comic.id}
            href={`/manga/${comic.id}`}
            className="group flex flex-col transition-transform hover:-translate-y-0.5"
          >
            {/* Poster cover */}
            <div className="relative aspect-[3/4.2] w-full overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-md group-hover:border-zinc-700">
              <Image
                src={comic.coverUrl}
                alt={comic.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>

            {/* Progress & Time */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-2 px-0.5">
              <span className="truncate">📖 {comic.readProgress}</span>
              <span className="text-zinc-500 shrink-0">{comic.timeAgo}</span>
            </div>

            {/* Title */}
            <h3 className="text-xs font-semibold text-zinc-200 group-hover:text-[#DF301C] text-center line-clamp-2 mt-1 leading-snug transition-colors">
              {comic.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
