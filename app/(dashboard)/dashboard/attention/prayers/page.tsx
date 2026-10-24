import { Suspense } from "react";
import { AttentionQueueClient } from "@/components/directories/AttentionQueueClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function PrayerRequestsPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading prayer requests…" />}><AttentionQueueClient kind="prayers" /></Suspense>;
}
