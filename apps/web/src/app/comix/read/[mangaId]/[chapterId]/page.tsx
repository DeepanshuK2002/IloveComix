import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { getComixChapters, getComixManga, readComixChapter } from "@/lib/comix/api";
import { proxyImage } from "@/lib/comix/client";
import type { ComixChapter } from "@/lib/comix/types";
import { ComixReaderView } from "@/components/comix/reader/ComixReaderView";
import { ComixAttribution } from "@/components/comix/ComixAttribution";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NAV_PAGES_LIMIT = 100;

function chapterLabel(chapter: ComixChapter): string {
  return chapter.name || `Chapter ${chapter.number ?? ""}`.trim() || "Chapter";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mangaId: string; chapterId: string }>;
}): Promise<Metadata> {
  const { mangaId, chapterId } = await params;
  const read = await readComixChapter(chapterId).catch(() => null);
  if (!read) return { title: "Chapter unavailable" };
  const title = await getComixManga(mangaId, true).catch(() => null);
  return { title: title ? `${title.title} — Chapter` : "Reader" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ mangaId: string; chapterId: string }>;
}) {
  const { mangaId, chapterId } = await params;
  const sfw = (await cookies()).get("ilovecomix-comix-sfw")?.value !== "false";

  const [read, manga] = await Promise.all([
    readComixChapter(chapterId).catch(() => null),
    getComixManga(mangaId, sfw).catch(() => null),
  ]);

  const images =
    read && read.images.length > 0
      ? read.images
          .map((src, index) => ({ id: index + 1, src: proxyImage(src) }))
          .filter((image): image is { id: number; src: string } => Boolean(image.src))
      : [];

  if (images.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="glass-card rounded-2xl border border-zinc-800/80 p-10">
          <TriangleAlert className="mx-auto h-8 w-8 text-zinc-500" aria-hidden="true" />
          <h1 className="mt-3 text-lg font-bold text-zinc-100">Chapter unavailable</h1>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-500">
            The unofficial Comix API could not return page images for this chapter.
            That endpoint is frequently offline — please try again shortly, or try a
            different chapter.
          </p>
          <Link
            href={`/comix/manga/${encodeURIComponent(mangaId)}`}
            className="mt-5 inline-flex items-center rounded-lg bg-[#DF301C] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#f33a23] focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
          >
            Back to chapters
          </Link>
        </div>
        <div className="mt-6 text-left">
          <ComixAttribution />
        </div>
      </div>
    );
  }

  // Build the prev/next map by fetching the first few chapter pages server-side.
  const chapterPool: ComixChapter[] = [];
  try {
    for (let page = 1; page <= 4; page += 1) {
      const result = await getComixChapters(mangaId, { page, limit: NAV_PAGES_LIMIT });
      if (!result || result.items.length === 0) break;
      chapterPool.push(...result.items);
      if (page >= result.lastPage) break;
    }
  } catch {
    // Navigation is best-effort; the reader still works without it.
  }

  const currentIndex = chapterPool.findIndex(
    (chapter) => String(chapter.id) === String(chapterId)
  );
  const prev =
    currentIndex > 0 && chapterPool[currentIndex - 1]
      ? { chapterId: String(chapterPool[currentIndex - 1].id), label: chapterLabel(chapterPool[currentIndex - 1]) }
      : null;
  const next =
    currentIndex >= 0 && currentIndex < chapterPool.length - 1
      ? { chapterId: String(chapterPool[currentIndex + 1].id), label: chapterLabel(chapterPool[currentIndex + 1]) }
      : null;

  const current = currentIndex >= 0 ? chapterPool[currentIndex] : null;

  return (
    <div className="reader-container">
      <ComixReaderView
        mangaId={mangaId}
        chapterId={chapterId}
        title={(current && chapterLabel(current)) || "Chapter"}
        mangaTitle={manga?.title ?? "Manga"}
        images={images}
        prev={prev}
        next={next}
      />
    </div>
  );
}