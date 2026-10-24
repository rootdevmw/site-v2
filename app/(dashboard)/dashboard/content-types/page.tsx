import { Suspense } from "react";
import { TypeCatalogClient } from "@/components/directories/TypeCatalogClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function ContentTypesPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading content types…" />}><TypeCatalogClient kind="content" /></Suspense>;
}
