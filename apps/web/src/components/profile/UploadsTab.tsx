"use client";

import { useState } from "react";
import { Plus, Search, BookOpen } from "lucide-react";

export function UploadsTab() {
  const [subTab, setSubTab] = useState<"titles" | "chapters">("titles");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All types");
  const [status, setStatus] = useState("All statuses");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Uploads
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage the titles and chapters you've uploaded.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DF301C] hover:bg-[#c72016] text-white font-bold text-xs transition-all shadow-md shadow-[#DF301C]/25 active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Upload</span>
        </button>
      </div>

      {/* Subtabs: Titles | Chapters */}
      <div className="flex items-center gap-6 border-b border-zinc-800/80 pb-2">
        <button
          type="button"
          onClick={() => setSubTab("titles")}
          className={`text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            subTab === "titles" ? "text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          Titles
        </button>
        <button
          type="button"
          onClick={() => setSubTab("chapters")}
          className={`text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            subTab === "chapters"
              ? "text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Chapters
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles you uploaded..."
            className="w-full rounded-xl border border-zinc-800 bg-[#16181d] pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-[#DF301C]/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-zinc-800 bg-[#16181d] px-3 py-2 text-xs text-zinc-200 focus:outline-none"
          >
            <option>All types</option>
            <option>Manga</option>
            <option>Manhwa</option>
            <option>Manhua</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-zinc-800 bg-[#16181d] px-3 py-2 text-xs text-zinc-200 focus:outline-none"
          >
            <option>All statuses</option>
            <option>Ongoing</option>
            <option>Completed</option>
            <option>Hiatus</option>
          </select>
        </div>
      </div>

      {/* Empty State (matching Screenshot 212651) */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/70 backdrop-blur-md p-16 text-center shadow-lg">
        <div className="h-12 w-12 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <BookOpen className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-zinc-200 mb-1">No titles.</h3>
        <p className="text-xs text-zinc-500">
          Upload a chapter to any manga page to start.
        </p>
      </div>
    </div>
  );
}
