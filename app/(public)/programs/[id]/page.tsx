import {
  ProgramDetails,
  programMetadata,
} from "@/components/public/programs/ProgramDetails";
import type { ProgramSearchParams } from "@/lib/utils/public-programs";
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<ProgramSearchParams>;
};
export async function generateMetadata({ params }: Props) {
  return programMetadata((await params).id);
}
export default async function PublicProgramDetailsPage({
  params,
  searchParams,
}: Props) {
  return (
    <ProgramDetails
      address={(await params).id}
      from={(await searchParams).from}
    />
  );
}
