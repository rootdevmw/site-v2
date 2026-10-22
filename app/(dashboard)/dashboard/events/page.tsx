import { Suspense } from "react";
import { ScheduleClient } from "@/components/directories/ScheduleClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function EventsPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading events…" />}><ScheduleClient kind="events" /></Suspense>;
}
