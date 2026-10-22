import { Suspense } from "react";
import { EditorialClient } from "@/components/directories/EditorialClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function ContentPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading content…" />}><EditorialClient kind="content" /></Suspense>;
}
