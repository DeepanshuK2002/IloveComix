"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import type { ComixChapter, ComixChapterPage } from "@/lib/comix/types";
import { ComixPagination } from "@/components/comix/ComixPagination";
import { ComixState } from "@/components/comix/ComixState";

const PAGE_LIMIT = 30;

function formatUploadDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface ComixChapterTableProps {
  mangaId: string;
  sfw: boolean;
}

export function ComixChapterTable({ mangaId, sfw }: ComixChapterTableProps) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ComixChapterPage | null>(null);
  const [groupFilter, setGroupFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  const run = useCallback(
    async (targetPage: number, targetGroup: string) => {
      const id = ++seq.current;
      setLoading(true);
      setError(null);
      try {
        const url = new URL(`/api/comix/manga/${encodeURIComponent(mangaId)}/chapters`, window.location.origin);
        url.searchParams.set("page", String(targetPage));
        url.searchParams.set("limit", String(PAGE_LIMIT));
        if (targetGroup) url.searchParams.set("scanlation_group_id", targetGroup);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);
        const response = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timer);
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error || `Chapters failed (${response.status})`);
        }
        const body = (await response.json()) as { data: ComixChapterPage };
        if (id !== seq.current) return;
        setResult(body.data);
        setPage(body.data.page);
      } catch (err) {
        if (id !== seq.current) return;
        setError(err instanceof Error ? err.message : "Chapters failed");
        setResult(null);
      } finally {
        if (id === seq.current) setLoading(false);
      }
    },
    [mangaId]
  );

  useEffect(() => {
    void run(page, groupFilter);
  }, [page, groupFilter, run]);

  const groupOptions = useMemo(() => {
    const seen = new Map<string, string>();
    if (result) {
      for (const chapter of result.items) {
        if (chapter.groupId && chapter.groupName) seen.set(chapter.groupId, chapter.groupName);
      }
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [result]);

  const allChapters = result?.items ?? [];
  const filteredVisible: ComixChapter[] = error
    ? []
    : groupFilter
      ? allChapters.filter((chapter) => chapter.groupId === groupFilter)
      : allChapters;

  const selectValue = groupFilter || (groupOptions.length === 1 ? groupOptions[0][0] : "");

  return (
    <section aria-labelledby="comix-chapters-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="comix-chapters-title" className="flex items-center gap-2 text-sm font-bold text-zinc-100">
          <BookOpen className="h-4 w-4 text-[#DF301C]" aria-hidden="true" />
          Chapters
          {result && result.total != null && (
            <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
              {result.total.toLocaleString()}
            </span>
          )}
        </h2>
        {groupOptions.length > 1 && (
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Group</span>
            <span className="relative">
              <select
                value={selectValue}
                onChange={(event) => {
                  setGroupFilter(event.target.value);
                  setPage(1);
                }}
                aria-label="Filter chapters by scanlation group"
                className="appearance-none rounded-lg border border-zinc-800 bg-[#141417] py-1.5 pl-3 pr-8 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none"
              >
                <option value="">All groups</option>
                {groupOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            </span>
          </label>
        )}
      </div>

      {error ? (
        <ComixState
          kind="error"
          title="Could not load chapters"
          hint={`${error} — the unofficial Comix API may be temporarily unavailable upstream.`}
          onRetry={() => void run(page, groupFilter)}
        />
      ) : loading && !result ? (
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-zinc-900" />
          ))}
        </div>
      ) : filteredVisible.length === 0 ? (
        <ComixState
          kind="unavailable"
          title="No chapters available"
          hint={
            result && result.total === 0
              ? "This title has no chapters in the Comix catalogue yet."
              : "The chapter list is empty — the unofficial Comix API may be temporarily unavailable upstream, or no chapters match the current group filter."
          }
          onRetry={() => void run(1, groupFilter)}
        />
      ) : (
        <>
          <ul className="divide-y divide-zinc-800/70 overflow-hidden rounded-xl border border-zinc-800/80 bg-[#141417]">
            {filteredVisible.map((chapter: ComixChapter) => (
              <li key={chapter.id}>
                <a
                  href={`/comix/read/${encodeURIComponent(mangaId)}/${encodeURIComponent(chapter.id)}`}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[11px] font-mono font-semibold text-zinc-400">
                    {chapter.number ?? "?"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-zinc-200">
                    {chapter.name || `Chapter ${chapter.number ?? ""}`.trim()}
                    {chapter.language && (
                      <span className="ml-2 rounded border border-zinc-700/70 bg-zinc-800/70 px-1.5 py-0.5 text-[9px] font-mono uppercase text-zinc-400">
                        {chapter.language}
                      </span>
                    )}
                  </span>
                  <span className="hidden shrink-0 text-xs text-zinc-500 sm:block">{chapter.groupName ?? "—"}</span>
                  <span className="hidden shrink-0 text-xs tabular-nums text-zinc-600 md:block">
                    {formatUploadDate(chapter.uploadDate)}
                  </span>
                  <span className="shrink-0 rounded-lg bg-[#DF301C] px-2.5 py-1 text-[11px] font-semibold text-white">
                    Read
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <ComixPagination
            page={result?.page ?? 1}
            lastPage={result?.lastPage ?? 1}
            onChange={setPage}
            label="of chapters"
          />
        </>
      )}
    </section>
  );
}