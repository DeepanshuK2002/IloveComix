"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { ComixGroup } from "@/lib/comix/types";
import { ComixState } from "@/components/comix/ComixState";
import { ComixAttribution } from "@/components/comix/ComixAttribution";

export function ComixGroupsPage() {
  const [keyword, setKeyword] = useState("");
  const [debounced, setDebounced] = useState("");
  const [groups, setGroups] = useState<ComixGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(keyword.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  const run = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/comix/groups", window.location.origin);
      if (debounced) url.searchParams.set("keyword", debounced);
      url.searchParams.set("limit", "48");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);
      const response = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Groups request failed (${response.status})`);
      }
      const body = (await response.json()) as { data: ComixGroup[] };
      if (id !== seq.current) return;
      setGroups(body.data);
    } catch (err) {
      if (id !== seq.current) return;
      setError(err instanceof Error ? err.message : "Groups request failed");
      setGroups([]);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    void run();
  }, [debounced, run]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">Scanlation Groups</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Community uploader groups on comix.to via the unofficial Comix API.
        </p>
      </header>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setDebounced(keyword.trim());
        }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search groups…"
            aria-label="Search scanlation groups"
            className="w-full rounded-xl border border-zinc-800 bg-[#141417] py-2.5 pl-10 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" aria-hidden="true" />
          )}
        </div>
      </form>

      {error ? (
        <ComixState
          kind="error"
          title="Groups request failed"
          hint={`${error} — the unofficial Comix API may be temporarily unavailable. Try again in a moment.`}
          onRetry={() => void run()}
        />
      ) : loading && groups.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-xl border border-zinc-800/80 bg-[#141417] p-4">
              <div className="mb-3 h-11 w-11 rounded-lg bg-zinc-800" />
              <div className="mb-2 h-3 w-2/3 rounded bg-zinc-800" />
              <div className="h-3 w-1/2 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <ComixState
          kind="empty"
          title={debounced ? `No groups match “${debounced}”` : "No groups available"}
          hint={
            debounced
              ? "Try a different spelling."
              : "The unofficial Comix API returned an empty group list — it may be temporarily unavailable upstream."
          }
          onRetry={() => void run()}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {groups.map((group) => (
              <div
                key={String(group.id)}
                className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-[#141417] p-4 transition-colors hover:border-zinc-700"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800">
                  {group.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={group.avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-zinc-500">{group.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">{group.name}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {typeof group.chapterCount === "number" ? `${group.chapterCount.toLocaleString()} chapters` : "—"}
                    {typeof group.views === "number" && group.views > 0
                      ? ` · ${group.views.toLocaleString()} views`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-zinc-600">
            {groups.length.toLocaleString()} group(s)
          </p>
        </>
      )}

      <ComixAttribution />
    </div>
  );
}