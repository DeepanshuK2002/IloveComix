"use client";

import { useState } from "react";
import { Plus, Search, FolderPlus, RotateCcw, X } from "lucide-react";
import { useUser } from "@/components/user/UserProvider";

export function CollectionsTab() {
  const { collections, createCollection } = useUser();
  const [subTab, setSubTab] = useState<"mine" | "liked">("mine");
  const [search, setSearch] = useState("");
  const [contentRating, setContentRating] = useState("Any");
  const [type, setType] = useState("Any");
  const [genres, setGenres] = useState("Any");
  const [demographic, setDemographic] = useState("Any");
  const [sortBy, setSortBy] = useState("Newest created");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleReset = () => {
    setSearch("");
    setContentRating("Any");
    setType("Any");
    setGenres("Any");
    setDemographic("Any");
    setSortBy("Newest created");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createCollection({
      title: newTitle.trim(),
      description: newDescription.trim(),
      comicCount: 0,
    });
    setNewTitle("");
    setNewDescription("");
    setIsModalOpen(false);
  };

  const filtered = collections.filter((c) => {
    if (subTab === "mine" && !c.isMine) return false;
    if (subTab === "liked" && c.isMine) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Collections
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Group titles into your own collections, or browse the ones you've
            liked from other readers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DF301C] hover:bg-[#c72016] text-white font-bold text-xs transition-all shadow-md shadow-[#DF301C]/25 active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New collection</span>
        </button>
      </div>

      {/* Subtabs: Mine | Liked */}
      <div className="flex items-center gap-6 border-b border-zinc-800/80 pb-2">
        <button
          type="button"
          onClick={() => setSubTab("mine")}
          className={`text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            subTab === "mine" ? "text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          Mine
        </button>
        <button
          type="button"
          onClick={() => setSubTab("liked")}
          className={`text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            subTab === "liked" ? "text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          Liked
        </button>
      </div>

      <p className="text-xs text-zinc-500 font-mono">
        {filtered.length} collections — group titles however you like.
      </p>

      {/* Filters Bar (matching Screenshot 212610) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 p-3 rounded-2xl border border-zinc-800/80 bg-[#16181d] text-xs">
        <div>
          <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
            SEARCH
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collec"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        <div>
          <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
            CONTENT RATING
          </span>
          <select
            value={contentRating}
            onChange={(e) => setContentRating(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
          >
            <option>Any</option>
            <option>Safe</option>
            <option>Suggestive</option>
            <option>Erotica</option>
          </select>
        </div>

        <div>
          <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
            TYPE
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
          >
            <option>Any</option>
            <option>Manga</option>
            <option>Manhwa</option>
            <option>Manhua</option>
          </select>
        </div>

        <div>
          <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
            GENRES
          </span>
          <select
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
          >
            <option>Any</option>
            <option>Action</option>
            <option>Fantasy</option>
            <option>Romance</option>
          </select>
        </div>

        <div>
          <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
            DEMOGRAPHIC
          </span>
          <select
            value={demographic}
            onChange={(e) => setDemographic(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
          >
            <option>Any</option>
            <option>Shounen</option>
            <option>Seinen</option>
            <option>Shoujo</option>
          </select>
        </div>

        <div>
          <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
            SORT BY
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
          >
            <option>Newest created</option>
            <option>Most popular</option>
            <option>Title A-Z</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Content list or Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/70 backdrop-blur-md p-16 text-center shadow-lg">
          <div className="h-12 w-12 rounded-full bg-[#DF301C]/15 flex items-center justify-center text-[#DF301C] mx-auto mb-4 shadow-sm">
            <FolderPlus className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-zinc-200 mb-1">
            No collections yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
            Create your first collection to start grouping titles.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DF301C] hover:bg-[#c72016] text-white font-bold text-xs transition-all shadow-md shadow-[#DF301C]/25 active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New collection</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((col) => (
            <div
              key={col.id}
              className="p-4 rounded-2xl border border-zinc-800 bg-[#16181d] shadow-md hover:border-zinc-700 transition-colors"
            >
              <h4 className="text-sm font-bold text-white mb-1">{col.title}</h4>
              <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                {col.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
                <span>{col.comicCount} titles</span>
                <span>{col.likes} likes</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#16181d] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Create New Collection
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Collection Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Favorite Romance Manhwa"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#DF301C]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What is this collection about?"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#DF301C]/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#DF301C] hover:bg-[#c72016] text-white font-bold text-xs transition-all shadow-sm shadow-[#DF301C]/25"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
