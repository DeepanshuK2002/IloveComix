import { Suspense } from "react";
import type { Metadata } from "next";
import { ComixBrowsePage } from "@/components/comix/browse/ComixBrowsePage";

export const metadata: Metadata = {
  title: "Comix Browse",
  description: "Browse and filter the Comix.to catalogue via the unofficial Comix API.",
};

export default function Page() {
  return (
    <Suspense>
      <ComixBrowsePage />
    </Suspense>
  );
}