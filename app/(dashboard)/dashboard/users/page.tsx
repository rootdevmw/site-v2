import { Suspense } from "react";
import { AccessClient } from "@/components/directories/AccessClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function UsersPage() {
  return <Suspense fallback={<DirectoryLoading label="Loading accounts…" />}><AccessClient kind="users" /></Suspense>;
}
