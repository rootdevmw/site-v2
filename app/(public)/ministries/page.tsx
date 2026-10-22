import type { Metadata } from "next";
import { GroupDirectory } from "@/components/public/groups/GroupDirectory";
import {
  readGroupFilters,
  type GroupSearchParams,
} from "@/lib/utils/public-groups";
export const metadata: Metadata = {
  title: "Ministries",
  description:
    "Find a place to serve, grow and belong at Church of Christ at Red Cross in Blantyre. Explore our ministries and ask the church team about taking part.",
};
export default async function MinistriesPage({
  searchParams,
}: {
  searchParams: Promise<GroupSearchParams>;
}) {
  return (
    <GroupDirectory
      kind="ministry"
      filters={readGroupFilters(await searchParams)}
    />
  );
}
