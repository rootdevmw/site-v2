import type { Metadata } from "next";
import { LibraryListing } from "@/components/public/OnlineLibrary";
import { readLibraryFilters } from "@/lib/utils/public-library";
import type { GroupSearchParams } from "@/lib/utils/public-groups";
export const metadata: Metadata = {
  alternates: { canonical: "/live" },
  title: "Watch online",
  description:
    "Join live worship, find scheduled broadcasts and explore earlier church broadcasts.",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<GroupSearchParams>;
}) {
  return (
    <LibraryListing
      kind="streams"
      filters={readLibraryFilters(await searchParams)}
    />
  );
}
