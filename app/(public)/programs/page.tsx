import type { Metadata } from "next";
import { ProgramDirectory } from "@/components/public/programs/ProgramDirectory";
import {
  readProgramFilters,
  type ProgramSearchParams,
} from "@/lib/utils/public-programs";
export const metadata: Metadata = {
  alternates: { canonical: "/programs" },
  title: "Programs",
  description:
    "Explore service and homecell programs at Church of Christ at Red Cross. Find dates, venues and the planned order of activities.",
};
export default async function PublicProgramsPage({
  searchParams,
}: {
  searchParams: Promise<ProgramSearchParams>;
}) {
  return <ProgramDirectory filters={readProgramFilters(await searchParams)} />;
}
