import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { getComixManga } from "@/lib/comix/api";
import { ComixDetailsPanel } from "@/components/comix/manga/ComixDetailsPanel";
import { ComixChapterTable } from "@/components/comix/manga/ComixChapterTable";
import { ComixAttribution } from "@/components/comix/ComixAttribution";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Params {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const sfw = (await cookies()).get("ilovecomix-comix-sfw")?.value !== "false";
  const manga = await getComixManga(id, sfw).catch(() => null);
  if (!manga) return { title: "Comic not found" };
  return {
    title: manga.title,
    description: manga.synopsis?.slice(0, 160) ?? undefined,
  };
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  const sfw = (await cookies()).get("ilovecomix-comix-sfw")?.value !== "false";
  const manga = await getComixManga(id, sfw).catch(() => null);

  if (!manga) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="glass-card rounded-2xl border border-zinc-800/80 p-10">
          <TriangleAlert className="mx-auto h-8 w-8 text-zinc-500" aria-hidden="true" />
          <h1 className="mt-3 text-lg font-bold text-zinc-100">Comic unavailable</h1>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-500">
            The unofficial Comix API could not return details for this title. That
            endpoint is frequently offline — the slug may be temporary, the title may
            be filtered by the current SFW setting, or the upstream service is down.
          </p>
          <Link
            href="/comix"
            className="mt-5 inline-flex items-center rounded-lg bg-[#DF301C] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#f33a23] focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
          >
            Back to Comix home
          </Link>
        </div>
        <div className="mt-6 text-left">
          <ComixAttribution />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <ComixDetailsPanel manga={manga} />
      <div className="mt-8">
        <ComixChapterTable mangaId={id} sfw={sfw} />
      </div>
      <div className="mt-8">
        <ComixAttribution />
      </div>
    </div>
  );
}