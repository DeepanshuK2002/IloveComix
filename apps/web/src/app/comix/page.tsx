import { Suspense } from "react";
import type { Metadata } from "next";
import { ComixHomeFeed } from "@/components/comix/home/ComixHomeFeed";

export const metadata: Metadata = {
  title: "Comix Library",
  description: "Unofficial Comix.to catalogue: browse, search, groups, and read.",
};

export default function Page() {
  return (
    <Suspense>
      <ComixHomeFeed />
    </Suspense>
  );
}