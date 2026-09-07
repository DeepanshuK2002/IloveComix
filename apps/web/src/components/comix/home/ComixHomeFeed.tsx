"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Layers, Users } from "lucide-react";
import type { ComixHome, ComixHomeRail, ComixManga } from "@/lib/comix/types";
import { ComixMangaGrid } from "@/components/comix/ComixMangaGrid";
import { ComixState } from "@/components/comix/ComixState";
import { ComixSfwToggle, useComixSfw } from "@/components/comix/ComixSfwToggle";
import { ComixAttribution } from "@/components/comix/ComixAttribution";
import { proxyImage } from "@/lib/comix/client";

function RailStrip({ rail }: { rail: ComixHomeRail }) {
  if (rail.items.length === 0) return null;
  return (
    <section aria-labelledby={`comix-rail-${rail.key}`} className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={`comix-rail-${rail.key}`} className="text-sm font-bold text-zinc-100">
          {rail.label}
        </h2>
        <Link
          href={`/comix/browse?feed=${encodeURIComponent(rail.key)}`}
          className="text-xs font-semibold text-zinc-500 transition-colors hover:text-white focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none rounded"
        >
          View all
        </Link>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex w-max gap-3">
          {rail.items.slice(0, 20).map((manga: ComixManga) => (
            <div key={manga.id} className="w-36 shrink-0 snap-start sm:w-40">
              <MiniCard manga={manga} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniCard({ manga }: { manga: ComixManga }) {
  const cover = proxyImage(manga.coverUrl);
  return (
    <Link
      href={manga.href}
      className="manga-card group block overflow-hidden rounded-xl border border-zinc-800/80 bg-[#141417] focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
      aria-label={manga.title}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-2 text-center">
            <span className="line-clamp-4 text-[11px] font-semibold text-zinc-400">{manga.title}</span>
          </div>
        )}
      </div>
      <h3 className="line-clamp-2 min-h-[2.4rem] p-2 text-[11px] font-semibold leading-4 text-zinc-100 group-hover:text-[#FF453A] transition-colors">
        {manga.title}
      </h3>
    </Link>
  );
}

export function ComixHomeFeed() {
  const [home, setHome] = useState<ComixHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sfw, setSfw] = useComixSfw();
  const seq = useRef(0);

  const run = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);
      const response = await fetch("/api/comix/home", { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Home failed (${response.status})`);
      }
      const body = (await response.json()) as { data: ComixHome };
      if (id !== seq.current) return;
      setHome(body.data);
    } catch (err) {
      if (id !== seq.current) return;
      setError(err instanceof Error ? err.message : "Home failed");
      setHome(null);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void run();
  }, [run]);

  const rails = home?.rails ?? [];
  const hasCollections = (home?.collections ?? []).length > 0;
  const hasGroups = (home?.popularGroups ?? []).length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">Comix Library</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Unofficial catalogue of comix.to community uploads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/comix/search"
            className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
          >
            Search
          </Link>
          <Link
            href="/comix/browse"
            className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
          >
            Browse
          </Link>
          <Link
            href="/comix/groups"
            className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
          >
            Groups
          </Link>
          <ComixSfwToggle sfw={sfw} onChange={setSfw} />
        </div>
      </header>

      {error ? (
        <ComixState
          kind="error"
          title="Comix home unavailable"
          hint={`${error} — the unofficial Comix API may be temporarily offline. Browse works on the sections below after a retry.`}
          onRetry={() => void run()}
        />
      ) : loading && !home ? (
        <div className="mt-8 space-y-8" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, railIndex) => (
            <div key={railIndex}>
              <div className="mb-3 h-4 w-40 animate-pulse rounded bg-zinc-800" />
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse overflow-hidden rounded-xl border border-zinc-800/80 bg-[#141417]">
                    <div className="aspect-[2/3] w-full bg-zinc-800/70" />
                    <div className="p-2">
                      <div className="h-3 rounded bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : rails.length === 0 && !hasCollections && !hasGroups ? (
        <ComixState
          kind="unavailable"
          title="No homepage content yet"
          hint="The unofficial Comix API returned no rails, groups, or collections — it may be temporarily unavailable upstream."
          onRetry={() => void run()}
        />
      ) : (
        <>
          {rails.map((rail) => (
            <RailStrip key={rail.key} rail={rail} />
          ))}

          {hasGroups && (
            <section className="mt-10" aria-labelledby="comix-popular-groups">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                <h2 id="comix-popular-groups" className="text-sm font-bold text-zinc-100">
                  Popular Groups
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {home?.popularGroups.map((group) => (
                  <Link
                    key={String(group.id)}
                    href="/comix/groups"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-[#141417] px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
                  >
                    {group.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={proxyImage(group.avatar) ?? ""} alt="" loading="lazy" className="h-4 w-4 rounded-full object-cover" />
                    ) : null}
                    <span className="font-medium">{group.name}</span>
                    {group.uploadCount != null && (
                      <span className="text-[10px] text-zinc-500">{group.uploadCount.toLocaleString()}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {hasCollections && (
            <section className="mt-10" aria-labelledby="comix-collections">
              <div className="mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                <h2 id="comix-collections" className="text-sm font-bold text-zinc-100">
                  Collections
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {home?.collections.map((collection) => {
                  const cover = collection.cover?.poster?.medium || collection.cover?.poster?.large;
                  const proxied = proxyImage(cover);
                  return (
                    <div
                      key={collection.id}
                      className="overflow-hidden rounded-xl border border-zinc-800/80 bg-[#141417]"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                        {proxied ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={proxied} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-zinc-900/80">
                            <Layers className="h-5 w-5 text-zinc-600" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 text-xs font-semibold text-zinc-100">{collection.name}</p>
                        <p className="mt-1 text-[10px] text-zinc-500">
                          {collection.itemCount?.toLocaleString()} title(s)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <ComixAttribution />
        </>
      )}
    </div>
  );
}