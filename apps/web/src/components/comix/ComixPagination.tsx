"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ComixPaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
  label?: string;
}

export function ComixPagination({ page, lastPage, onChange, label }: ComixPaginationProps) {
  const canPrevious = page > 1;
  const canNext = page < lastPage && lastPage > 0;
  if (lastPage <= 1) return null;

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-3"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={!canPrevious}
        aria-label="Previous page"
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none cursor-pointer disabled:pointer-events-none"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Prev</span>
      </button>
      <span className="text-xs font-medium tabular-nums text-zinc-400" aria-live="polite">
        Page {label ? `${label} ` : ""}
        <span className="text-zinc-200">{page}</span> / {Math.max(1, lastPage)}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!canNext}
        aria-label="Next page"
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none cursor-pointer disabled:pointer-events-none"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}