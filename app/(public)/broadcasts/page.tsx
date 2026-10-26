import type { Metadata } from "next";
import { LibraryListing } from "@/components/public/OnlineLibrary";
import { readLibraryFilters } from "@/lib/utils/public-library";
import type { GroupSearchParams } from "@/lib/utils/public-groups";

export const metadata: Metadata = {
  title: "Broadcast library",
  alternates: { canonical: "/broadcasts" },
  description:
    "Explore upcoming broadcasts and earlier recordings from Church of Christ at Red Cross.",
};
export default async function BroadcastsPage({
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
