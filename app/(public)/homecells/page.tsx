import type { Metadata } from "next";
import { GroupDirectory } from "@/components/public/groups/GroupDirectory";
import {
  readGroupFilters,
  type GroupSearchParams,
} from "@/lib/utils/public-groups";
export const metadata: Metadata = {
  title: "Homecells",
  description:
    "Find a homecell at Church of Christ at Red Cross in Blantyre. Explore groups and programs, learn about midweek prayers and ask the church team about joining.",
};
export default async function HomecellsPage({
  searchParams,
}: {
  searchParams: Promise<GroupSearchParams>;
}) {
  return (
    <GroupDirectory
      kind="homecell"
      filters={readGroupFilters(await searchParams)}
    />
  );
}
