import { Suspense } from "react";
import { EditorialClient } from "@/components/directories/EditorialClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function PublicationsPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading publications…" />}><EditorialClient kind="publications" /></Suspense>;
}
