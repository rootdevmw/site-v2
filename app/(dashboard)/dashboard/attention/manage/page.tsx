import { Suspense } from "react";
import { PrayerTeamClient } from "@/components/directories/PrayerTeamClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function PrayerTeamPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading prayer team…" />}><PrayerTeamClient /></Suspense>;
}
