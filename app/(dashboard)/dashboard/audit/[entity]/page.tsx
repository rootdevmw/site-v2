import { Suspense } from "react";
import { AuditClient } from "@/components/directories/AuditClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function AuditEntityPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading history…" />}><AuditClient /></Suspense>;
}
