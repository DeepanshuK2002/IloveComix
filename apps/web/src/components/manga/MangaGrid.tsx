import { MangaCard } from "./MangaCard";
import type { SearchResult } from "@/lib/types";

interface MangaGridProps {
  manga: SearchResult[];
  showLatest?: boolean;
  latestChapters?: Map<string, { chapter: string; date: string }>;
}

export function MangaGrid({
  manga,
  showLatest,
  latestChapters,
}: MangaGridProps) {
  if (!manga || manga.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
        <p className="text-zinc-400 text-sm font-mono">No manga titles found</p>
        <p className="text-zinc-600 text-xs mt-1">
          Try adjusting your search criteria or explore trending releases
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
      {manga.map((m) => {
        const latest = latestChapters?.get(m.id);
        return (
          <MangaCard
            key={m.id}
            manga={m}
            showLatest={showLatest}
            latestChapter={latest?.chapter}
            latestDate={latest?.date}
          />
        );
      })}
    </div>
  );
}
