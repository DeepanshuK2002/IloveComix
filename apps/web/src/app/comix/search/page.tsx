import { Suspense } from "react";
import type { Metadata } from "next";
import { ComixSearchPage } from "@/components/comix/search/ComixSearchPage";

export const metadata: Metadata = {
  title: "Comix Search",
  description: "Search the Comix.to catalogue via the unofficial Comix API.",
};

export default function Page() {
  return (
    <Suspense>
      <ComixSearchPage />
    </Suspense>
  );
}