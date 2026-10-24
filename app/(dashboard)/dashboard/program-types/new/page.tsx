"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { CatalogTypeForm } from "@/components/directories/CatalogTypeForm";
import { DirectoryError } from "@/components/directories/DirectoryList";

export default function NewProgramTypePage() {
  const router = useRouter();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  return <section className="record-page directory-page" aria-labelledby="new-type-title">
    <header className="directory-header"><div><Link href="/dashboard/program-types" className="record-back">← Program types</Link><p className="record-eyebrow">Church record categories</p><h1 id="new-type-title" className="record-title">Add program type</h1><p className="record-description">Create a category to organize service schedules and program templates.</p></div></header>
    {permitted ? <div className="record-section max-w-xl"><CatalogTypeForm kind="programs" onSuccess={() => router.push("/dashboard/program-types")} onCancel={() => router.push("/dashboard/program-types")} /></div> : <DirectoryError noun="catalog" error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} />}
  </section>;
}
