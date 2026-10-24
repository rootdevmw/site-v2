import type { Metadata } from "next";
import { LibraryListing } from "@/components/public/OnlineLibrary";
import { readLibraryFilters } from "@/lib/utils/public-library";
import type { GroupSearchParams } from "@/lib/utils/public-groups";
export const metadata: Metadata = {
  alternates: { canonical: "/publications" },
  title: "Publications",
  description:
    "Read publications, updates and teaching from Church of Christ at Red Cross.",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<GroupSearchParams>;
}) {
  return (
    <LibraryListing
      kind="publications"
      filters={readLibraryFilters(await searchParams)}
    />
  );
}
