import Link from "next/link";
import { Star } from "lucide-react";
import type { ComixManga } from "@/lib/comix/types";

export function ComixMangaCard({ manga }: { manga: ComixManga }) {
  const typeLabel = manga.type ? manga.type.toUpperCase() : null;
  const status = manga.status?.toLowerCase();

  return (
    <Link
      href={manga.href}
      className="manga-card group block overflow-hidden rounded-xl border border-zinc-800/80 bg-[#141417] focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
      aria-label={`${manga.title} ${manga.chapter ? `(${manga.chapter})` : ""}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        {manga.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={manga.coverUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900/80 p-3 text-center">
            <span className="line-clamp-4 text-xs font-semibold text-zinc-400">{manga.title}</span>
          </div>
        )}
        <div className="manga-card-overlay absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        {manga.score != null && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-amber-400 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400" aria-hidden="true" />
            {typeof manga.score === "number" ? manga.score.toFixed(1) : manga.score}
          </div>
        )}
        {manga.chapter && (
          <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-200 backdrop-blur-sm">
            {manga.chapter}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-5 text-zinc-100 group-hover:text-[#FF453A] transition-colors">
          {manga.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {typeLabel && (
            <span className="rounded border border-zinc-700/70 bg-zinc-800/70 px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              {typeLabel}
            </span>
          )}
          {status && (
            <span
              className={`rounded border px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${
                status === "releasing"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : status === "completed"
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              {status}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}