import { Suspense } from "react";
import { AttentionQueueClient } from "@/components/directories/AttentionQueueClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function VisitorsPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading visitor follow-up…" />}><AttentionQueueClient kind="visitors" /></Suspense>;
}
