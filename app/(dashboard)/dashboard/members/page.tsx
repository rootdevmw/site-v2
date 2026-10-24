import { Suspense } from "react";
import { DirectoryClient } from "@/components/directories/DirectoryClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function MembersPage() {
  return <Suspense fallback={<DirectoryLoading />}><DirectoryClient kind="members" /></Suspense>;
}
