import {
  OnlineDetails,
  onlineMetadata,
} from "@/components/public/OnlineLibrary";
import type { GroupSearchParams } from "@/lib/utils/public-groups";
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<GroupSearchParams>;
};
export async function generateMetadata({ params }: Props) {
  return onlineMetadata("publications", (await params).id);
}
export default async function Page({ params, searchParams }: Props) {
  return (
    <OnlineDetails
      kind="publications"
      address={(await params).id}
      from={(await searchParams).from}
    />
  );
}
