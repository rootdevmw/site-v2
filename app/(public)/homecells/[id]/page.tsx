import {
  GroupDetails,
  publicGroupMetadata,
} from "@/components/public/groups/GroupDetails";
import type { GroupSearchParams } from "@/lib/utils/public-groups";
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<GroupSearchParams>;
};
export async function generateMetadata({ params }: Props) {
  return publicGroupMetadata("homecell", (await params).id);
}
export default async function HomecellPage({ params, searchParams }: Props) {
  return (
    <GroupDetails
      kind="homecell"
      address={(await params).id}
      from={(await searchParams).from}
    />
  );
}
