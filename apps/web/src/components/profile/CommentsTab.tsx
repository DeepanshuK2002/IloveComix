"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

const COMMENTS = [
  {
    id: "comment-1",
    comicTitle: "Genius Archer's Livestreaming",
    comicId: "aa62f35d-fde9-46bb-a351-985b13c491c4",
    text: "I am so disappointed with new manhwa that by there name you see something new / fresh but when you reach or cross 20 -30 chapter whytf they are similar to other stories as predictable as they can",
    timeAgo: "2w ago",
    likes: 1,
    dislikes: 0,
    replies: 0,
    coverUrl:
      "https://uploads.mangadex.org/covers/aa62f35d-fde9-46bb-a351-985b13c491c4/bca1bb39-c840-439f-a6e5-7812c9f66694.jpg.256.jpg",
  },
  {
    id: "comment-2",
    comicTitle: "30 Years Have Passed Since the Prologue",
    comicId: "b4061c12-f107-412d-8565-978ce829c79f",
    text: "Who is the black hair guy with a status window. Is he a new main character or all the people will get the status window?",
    timeAgo: "1mo ago",
    likes: 0,
    dislikes: 0,
    replies: 0,
    coverUrl:
      "https://uploads.mangadex.org/covers/b4061c12-f107-412d-8565-978ce829c79f/08ea4e36-1ab0-4dcd-8c10-04ea20f1ccb3.jpg.256.jpg",
  },
  {
    id: "comment-3",
    comicTitle: "Secretly Strong and Searching for My Daddy",
    comicId: "b16f47a2-0a01-41d2-b90d-76367cb28459",
    text: "Oooooo",
    timeAgo: "1mo ago",
    likes: 0,
    dislikes: 0,
    replies: 0,
    coverUrl:
      "https://uploads.mangadex.org/covers/b16f47a2-0a01-41d2-b90d-76367cb28459/3bf77248-33d2-410a-bfcd-e864c1860388.png.256.jpg",
  },
];

import { useUser } from "@/components/user/UserProvider";

export function CommentsTab() {
  const { comments: liveComments } = useUser();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "liked" | "replies">("recent");

  const list = liveComments && liveComments.length > 0 ? liveComments : COMMENTS;

  const filtered = list.filter(
    (c) =>
      c.comicTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Comments
          </h2>
          <p className="text-xs text-zinc-400 mt-1">{list.length} comments you've posted.</p>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments"
              className="rounded-xl border border-zinc-800 bg-[#16181d] pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-[#DF301C]/50 focus:outline-none"
            />
          </div>

          <div className="flex p-0.5 rounded-lg border border-zinc-800 bg-[#14161b]">
            <button
              type="button"
              onClick={() => setSort("recent")}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                sort === "recent"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Recent
            </button>
            <button
              type="button"
              onClick={() => setSort("liked")}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                sort === "liked"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Most liked
            </button>
            <button
              type="button"
              onClick={() => setSort("replies")}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                sort === "replies"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Most replies
            </button>
          </div>
        </div>
      </div>

      {/* Comment Cards List (matching Screenshot 212640) */}
      <div className="space-y-3">
        {filtered.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-800/80 bg-[#16181d]/80 shadow-md"
          >
            <div className="relative h-12 w-9 rounded-md overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 shadow-sm mt-0.5">
              <Image
                src={comment.coverUrl}
                alt={comment.comicTitle}
                fill
                sizes="36px"
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/manga/${comment.comicId}`}
                className="text-xs sm:text-sm font-semibold text-zinc-200 hover:text-[#DF301C] transition-colors"
              >
                {comment.comicTitle}
              </Link>

              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                {comment.text}
              </p>

              <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 mt-3">
                <span>{comment.timeAgo}</span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{comment.likes}</span>
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3" />
                  <span>{comment.dislikes}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{comment.replies}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
