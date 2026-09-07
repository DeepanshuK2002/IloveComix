import { Suspense } from "react";
import type { Metadata } from "next";
import { ComixGroupsPage } from "@/components/comix/groups/ComixGroupsPage";

export const metadata: Metadata = {
  title: "Comix Groups",
  description: "Scanlation groups on the Comix.to catalogue via the unofficial Comix API.",
};

export default function Page() {
  return (
    <Suspense>
      <ComixGroupsPage />
    </Suspense>
  );
}