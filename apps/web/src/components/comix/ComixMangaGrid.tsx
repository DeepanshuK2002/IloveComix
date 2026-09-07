import type { ComixManga } from "@/lib/comix/types";
import { ComixMangaCard } from "./ComixMangaCard";

export function ComixMangaGrid({ items }: { items: ComixManga[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((manga) => (
        <ComixMangaCard key={manga.id} manga={manga} />
      ))}
    </div>
  );
}