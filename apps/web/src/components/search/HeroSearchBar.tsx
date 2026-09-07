"use client";

import { useSearchModal } from "./SearchModalContext";
import { Search } from "lucide-react";

export function HeroSearchBar() {
  const { openSearch } = useSearchModal();

  return (
    <div className="max-w-xl mx-auto mb-6">
      <button
        type="button"
        onClick={() => openSearch()}
        className="relative w-full group text-left focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-xl"
        aria-label="Open search dialog"
      >
        <div className="relative flex items-center w-full rounded-xl border border-zinc-800/90 bg-zinc-950/80 py-3 pl-10 pr-24 text-sm text-zinc-500 shadow-inner group-hover:border-zinc-700 group-hover:bg-zinc-900/90 transition-all select-none">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors"
            aria-hidden="true"
          />
          <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
            Search by title, author, or genre…
          </span>
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#FF453A] hover:bg-[#ff5e54] px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-sm shadow-[#FF453A]/25">
            Search
          </div>
        </div>
      </button>
    </div>
  );
}
