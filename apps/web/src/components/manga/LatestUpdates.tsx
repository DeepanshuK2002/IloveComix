import Link from "next/link";
import Image from "next/image";
import type { Chapter, SearchResult } from "@/lib/types";
import { formatDate, getTypeBadge, cn } from "@/lib/utils";

interface LatestUpdatesProps {
  items: { chapter: Chapter; manga: SearchResult }[];
}

export function LatestUpdates({ items }: LatestUpdatesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {items.map(({ chapter, manga }) => {
        const typeBadge = getTypeBadge(manga.type);
        const chapterNum = chapter.chapter || chapter.title?.split(" ").pop() || "?";

        return (
          <Link
            key={chapter.id}
            href={`/manga/${manga.id}`}
            className="group flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-[#0c0c0e]/80 p-3 hover:border-zinc-700 hover:bg-[#121214] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
            aria-label={`Read ${manga.title} chapter ${chapterNum}`}
          >
            {/* Cover Thumbnail */}
            <div className="relative w-14 h-20 shrink-0 overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800/80">
              {manga.coverUrl ? (
                <Image
                  src={manga.coverUrl}
                  alt={manga.title}
                  fill
                  sizes="56px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600 text-[10px] font-mono">
                  N/A
                </div>
              )}
            </div>

            {/* Content info */}
            <div className="flex-1 min-w-0 flex flex-col h-full justify-between py-0.5">
              <div>
                <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors duration-150 line-clamp-1 tracking-tight">
                  {manga.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {manga.type && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded border px-1 py-0.2 text-[9px] font-mono tracking-wider",
                        typeBadge.className
                      )}
                    >
                      {typeBadge.label}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-200">
                    Ch.&nbsp;{chapterNum}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span className="truncate max-w-[110px]" title={chapter.scanlationGroup || "Official"}>
                  {chapter.scanlationGroup || "Official"}
                </span>
                <span className="tabular-nums shrink-0">{formatDate(chapter.publishAt)}</span>
              </div>
            </div>
          </Link>
        );
      })}

      {items.length === 0 && (
        <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
          <p className="text-zinc-400 text-sm font-mono">No recent releases found</p>
          <p className="text-zinc-600 text-xs mt-1">
            Check back later or browse all manga
          </p>
        </div>
      )}
    </div>
  );
}
