import { Suspense } from "react";
import { TypeCatalogClient } from "@/components/directories/TypeCatalogClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function ProgramTypesPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading program types…" />}><TypeCatalogClient kind="programs" /></Suspense>;
}
