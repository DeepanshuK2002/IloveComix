"use client";

import { useState, useRef, useEffect } from "react";
import { useCollections } from "@/lib/collections";
import {
  ListPlus,
  Search,
  Plus,
  Check,
  ChevronRight,
} from "lucide-react";

interface CollectionSelectProps {
  comicId: string;
  comicTitle?: string;
}

export function CollectionSelect({ comicId, comicTitle }: CollectionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { collections, memberCollections, addCollection, toggle } =
    useCollections(comicId);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsCreating(false);
        setSearchQuery("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    addCollection(newColName.trim(), comicId);
    setNewColName("");
    setIsCreating(false);
  };

  const isInAnyCollection = memberCollections.length > 0;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button matching screenshot: [ ≡+ Add to Collection > ] */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full inline-flex items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none ${
          isInAnyCollection
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
            : "border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white shadow-sm"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ListPlus className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
          <span className="truncate">
            {isInAnyCollection
              ? `In ${memberCollections.length} ${
                  memberCollections.length === 1 ? "Collection" : "Collections"
                }`
              : "Add to Collection"}
          </span>
        </div>

        <ChevronRight
          className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Card anchored beneath */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 z-30 w-full min-w-[240px] rounded-2xl border border-zinc-800 bg-[#0e0e12] p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
          role="dialog"
          aria-label="Collections selector"
        >
          {/* Top Search Input matching screenshot */}
          <div className="flex items-center gap-2 px-1 pb-2 border-b border-zinc-800/80 mb-2">
            <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your collections..."
              className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-full"
            />
          </div>

          {/* Middle Body: Empty State or Collections List */}
          {filteredCollections.length === 0 ? (
            <div className="py-7 text-center text-xs text-zinc-400 font-normal">
              {searchQuery.trim()
                ? "No matching collections."
                : "No collections yet."}
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-0.5 py-1 custom-scrollbar">
              {filteredCollections.map((col) => {
                const isMember = col.comicIds.includes(comicId);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggle(col.id, comicId)}
                    className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                      isMember
                        ? "bg-zinc-800/90 text-white"
                        : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isMember
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                            : "border-zinc-700 bg-zinc-900"
                        }`}
                      >
                        {isMember && <Check className="h-3 w-3" />}
                      </div>
                      <span className="truncate">{col.name}</span>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500 ml-2 shrink-0">
                      {col.comicIds.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Bottom Footer: Create New Collection */}
          <div className="border-t border-zinc-800/80 pt-2 mt-2">
            {!isCreating ? (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors w-full px-1 py-1"
              >
                <Plus className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                <span>Create new collection</span>
              </button>
            ) : (
              <form onSubmit={handleCreate} className="space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="Collection name..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-400 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewColName("");
                    }}
                    className="rounded-lg px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newColName.trim()}
                    className="rounded-lg bg-white px-3 py-1 text-[11px] font-semibold text-black hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-sm"
                  >
                    Create & Add
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
