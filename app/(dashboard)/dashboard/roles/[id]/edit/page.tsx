"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRole, useDeleteRole } from "@/app/modules/roles/hooks/useRoleActions";
import { RoleForm } from "@/app/modules/roles/components/RoleForm";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export default function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["ROOT"]);
  const query = useRole(id, permitted);
  const { mutateAsync: remove } = useDeleteRole();
  if (!permitted) return <RecordFeedback kind="forbidden" entity="Role" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading role editor…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Role" backHref="/dashboard/roles" backLabel="Back to roles" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Role" backHref="/dashboard/roles" backLabel="Back to roles" />;

  const record = query.data.data;
  return <div className="min-w-0 space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold text-[var(--text-primary)]">Edit role</h1><p className="mt-1 text-sm leading-7 text-[var(--text-secondary)]">Role names are used by the configured access hierarchy.</p></div><Link href={"/dashboard/roles/" + encodeURIComponent(record.id)} className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--text-secondary)] underline">View role</Link></div>
    <div className="min-w-0 rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-4 sm:p-6"><RoleForm mode="edit" initialData={{ id: record.id, name: record.name }} onDelete={async () => { await remove(record.id); router.push("/dashboard/roles"); }} /></div>
  </div>;
}
