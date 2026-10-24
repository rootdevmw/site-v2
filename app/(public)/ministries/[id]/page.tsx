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
  return publicGroupMetadata("ministry", (await params).id);
}
export default async function MinistryPage({ params, searchParams }: Props) {
  return (
    <GroupDetails
      kind="ministry"
      address={(await params).id}
      from={(await searchParams).from}
    />
  );
}
