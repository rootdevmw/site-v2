import { Suspense } from "react";
import { EditorialClient } from "@/components/directories/EditorialClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function StreamsPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading streams…" />}><EditorialClient kind="streams" /></Suspense>;
}
