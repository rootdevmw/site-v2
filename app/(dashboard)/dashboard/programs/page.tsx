import { Suspense } from "react";
import { ScheduleClient } from "@/components/directories/ScheduleClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function ProgramsPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading programs…" />}><ScheduleClient kind="programs" /></Suspense>;
}
