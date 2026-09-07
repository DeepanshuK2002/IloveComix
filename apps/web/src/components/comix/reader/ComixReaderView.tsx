"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";

export interface ComixReaderImage {
  id: number;
  src: string;
}

interface ComixReaderViewProps {
  mangaId: string;
  chapterId: string;
  title: string;
  images: ComixReaderImage[];
  mangaTitle: string;
  prev?: { chapterId: string; label: string } | null;
  next?: { chapterId: string; label: string } | null;
}

function ReaderImage({ index, src, mangaTitle }: { index: number; src: string; mangaTitle: string }) {
  const [bust, setBust] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-[2/3] w-full max-w-3xl flex-col items-center justify-center gap-2 rounded-xl border border-zinc-800/80 bg-[#141417] p-8">
        <TriangleAlert className="h-6 w-6 text-zinc-500" aria-hidden="true" />
        <p className="text-xs text-zinc-400">
          Page {index + 1} failed to load from the proxy.
        </p>
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            setBust((previous) => previous + 1);
          }}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 cursor-pointer focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
        >
          Retry page
        </button>
      </div>
    );
  }

  const url = new URL(src, window.location.origin);
  if (bust > 0) url.searchParams.set("retry", String(bust));

  return (
    <div className="flex w-full justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url.toString()}
        alt={`${mangaTitle} — page ${index + 1}`}
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          if (bust >= 2) {
            setFailed(true);
          } else {
            setBust((previous) => previous + 1);
          }
        }}
        className="h-auto w-full max-w-[900px] rounded-lg object-contain"
      />
    </div>
  );
}

export function ComixReaderView({ mangaId, chapterId, title, images, mangaTitle, prev, next }: ComixReaderViewProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && next) {
        window.location.href = `/comix/read/${encodeURIComponent(mangaId)}/${encodeURIComponent(next.chapterId)}`;
      } else if (event.key === "ArrowLeft" && prev) {
        window.location.href = `/comix/read/${encodeURIComponent(mangaId)}/${encodeURIComponent(prev.chapterId)}`;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mangaId, prev, next]);

  return (
    <div className="reader-container mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-zinc-500">{mangaTitle}</p>
          <h1 className="mt-0.5 truncate text-base font-bold text-zinc-100">{title}</h1>
        </div>
        <Link
          href={`/comix/manga/${encodeURIComponent(mangaId)}`}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
        >
          Chapters
        </Link>
      </header>

      <nav className="mb-5 grid grid-cols-2 gap-3" aria-label="Chapter navigation">
        {prev ? (
          <Link
            href={`/comix/read/${encodeURIComponent(mangaId)}/${encodeURIComponent(prev.chapterId)}`}
            rel="prev"
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#141417] px-3 py-2.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Prev · {prev.label}</span>
          </Link>
        ) : (
          <span className="flex items-center gap-2 rounded-xl border border-zinc-800/60 px-3 py-2.5 text-xs text-zinc-600">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            First chapter
          </span>
        )}
        {next ? (
          <Link
            href={`/comix/read/${encodeURIComponent(mangaId)}/${encodeURIComponent(next.chapterId)}`}
            rel="next"
            className="flex items-center justify-end gap-2 rounded-xl border border-zinc-800 bg-[#141417] px-3 py-2.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
          >
            <span className="truncate">Next · {next.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : (
          <span className="flex items-center justify-end gap-2 rounded-xl border border-zinc-800/60 px-3 py-2.5 text-xs text-zinc-600">
            Latest chapter
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </nav>

      <div className="space-y-4">
        {images.map((image) => (
          <ReaderImage key={image.id} index={image.id - 1} src={image.src} mangaTitle={mangaTitle} />
        ))}
      </div>

      <footer className="mt-8 text-center text-[11px] text-zinc-600">
        {chapterId && <span>Chapter ID {chapterId} · </span>}
        Pages are streamed on demand via this app&apos;s proxy and are never stored.
      </footer>
    </div>
  );
}