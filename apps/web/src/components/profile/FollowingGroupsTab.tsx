"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function FollowingGroupsTab() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "az" | "members">("recent");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Following Groups
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            0 scanlation groups you follow.
          </p>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groups"
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
              onClick={() => setSort("az")}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                sort === "az"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              A-Z
            </button>
            <button
              type="button"
              onClick={() => setSort("members")}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                sort === "members"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Members
            </button>
          </div>
        </div>
      </div>

      {/* Empty State Container (matching Screenshot 212547) */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/70 backdrop-blur-md p-16 text-center shadow-lg">
        <h3 className="text-base font-bold text-zinc-200 mb-1">
          Not following any groups yet.
        </h3>
        <p className="text-xs text-zinc-500">
          Find a group from any series and tap Follow.
        </p>
      </div>
    </div>
  );
}
