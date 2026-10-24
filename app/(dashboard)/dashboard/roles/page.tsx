import { Suspense } from "react";
import { AccessClient } from "@/components/directories/AccessClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function RolesPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading roles…" />}><AccessClient kind="roles" /></Suspense>;
}
