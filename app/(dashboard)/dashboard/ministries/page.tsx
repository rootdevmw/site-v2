import { Suspense } from "react";
import { DirectoryClient } from "@/components/directories/DirectoryClient";
import { DirectoryLoading } from "@/components/directories/DirectoryList";

export default function MinistriesPage() {
  return <Suspense fallback={<DirectoryLoading />}><DirectoryClient kind="ministries" /></Suspense>;
}
