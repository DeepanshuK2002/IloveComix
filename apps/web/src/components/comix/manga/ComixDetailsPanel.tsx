import Link from "next/link";
import { ArrowLeft, Eye, Heart, Star } from "lucide-react";
import type { ComixMangaDetails } from "@/lib/comix/types";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href={`/comix/search?q=${encodeURIComponent(String(children))}`}
      className="rounded-full border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
    >
      {children}
    </Link>
  );
}

export function ComixDetailsPanel({ manga }: { manga: ComixMangaDetails }) {
  const releaseBadge = (() => {
    if (manga.year) return `Year ${manga.year}`;
    return null;
  })();

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* Cover */}
      <div className="mx-auto w-full max-w-[240px] lg:mx-0">
        <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900">
          {manga.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={manga.coverUrl}
              alt={`Cover art for ${manga.title}`}
              loading="eager"
              decoding="async"
              className="aspect-[2/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center p-4 text-center">
              <span className="text-sm font-semibold text-zinc-500">{manga.title}</span>
            </div>
          )}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="glass-card rounded-lg p-2">
            <p className="flex items-center justify-center gap-1 text-sm font-bold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" aria-hidden="true" />
              {manga.score != null ? (typeof manga.score === "number" ? manga.score.toFixed(1) : manga.score) : "—"}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500">Score</p>
          </div>
          <div className="glass-card rounded-lg p-2">
            <p className="flex items-center justify-center gap-1 text-sm font-bold text-zinc-200">
              <Heart className="h-3.5 w-3.5 text-[#DF301C]" aria-hidden="true" />
              {manga.follows != null ? manga.follows.toLocaleString() : "—"}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500">Follows</p>
          </div>
          <div className="glass-card rounded-lg p-2">
            <p className="flex items-center justify-center gap-1 text-sm font-bold text-zinc-200">
              <Eye className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
              {manga.views != null ? manga.views.toLocaleString() : "—"}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500">Views</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div>
        <Link
          href="/comix"
          className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none rounded"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Comix
        </Link>

        <h1 className="text-xl font-bold leading-snug text-zinc-50 sm:text-2xl">{manga.title}</h1>

        {manga.altTitles.length > 0 && (
          <p className="mt-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-400">Alt: </span>
            {manga.altTitles.join(" · ")}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(manga.type?.toUpperCase() ?? null) && (
            <span className="rounded border border-zinc-700/70 bg-zinc-800/70 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-300">
              {manga.type}
            </span>
          )}
          {manga.status && (
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
              {manga.status}
            </span>
          )}
          {releaseBadge && (
            <span className="rounded border border-zinc-700/70 bg-zinc-800/70 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              {releaseBadge}
            </span>
          )}
          {manga.contentRating && (
            <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-400">
              {manga.contentRating}
            </span>
          )}
        </div>

        {(manga.genres.length > 0 || manga.themes.length > 0) && (
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              Genres
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[...manga.genres, ...manga.themes].map((genre) => (
                <Chip key={genre}>{genre}</Chip>
              ))}
            </div>
          </div>
        )}

        {manga.synopsis && (
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">
            {manga.synopsis}
          </p>
        )}

        {(manga.authors.length > 0 || manga.artists.length > 0) && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-4">
            {manga.authors.length > 0 && (
              <div>
                <p className="mb-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">Authors</p>
                <p className="text-sm text-zinc-300">{manga.authors.join(", ")}</p>
              </div>
            )}
            {manga.artists.length > 0 && (
              <div>
                <p className="mb-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">Artists</p>
                <p className="text-sm text-zinc-300">{manga.artists.join(", ")}</p>
              </div>
            )}
          </div>
        )}

        {manga.links && Object.keys(manga.links).length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              Source
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(manga.links).map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}