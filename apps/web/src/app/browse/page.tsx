import { Suspense } from "react";
import { BrowsePage } from "@/components/browse/BrowsePage";

export const metadata = {
  title: "Browse Manga - Ilovecomix",
  description:
    "Browse and discover manga, manhwa, and manhua. Filter by genre, status, type, and more.",
};

export default function BrowseRoute() {
  return (
    <Suspense>
      <BrowsePage />
    </Suspense>
  );
}
