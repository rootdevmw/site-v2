import {
  OnlineDetails,
  onlineMetadata,
} from "@/components/public/OnlineLibrary";
import type { GroupSearchParams } from "@/lib/utils/public-groups";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<GroupSearchParams>;
};
export async function generateMetadata({ params }: Props) {
  return onlineMetadata("streams", (await params).slug);
}
export default async function Page({ params, searchParams }: Props) {
  return (
    <OnlineDetails
      kind="streams"
      address={(await params).slug}
      from={(await searchParams).from}
    />
  );
}
