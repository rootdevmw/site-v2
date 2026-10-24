import { Suspense } from "react";
import { ScheduleClient } from "@/components/directories/ScheduleClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function ProgramTemplatesPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading program templates…" />}><ScheduleClient kind="program-templates" /></Suspense>;
}
