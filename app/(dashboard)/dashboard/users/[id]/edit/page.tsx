"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser, useDeleteUser } from "@/app/modules/users/hooks/useUserActions";
import { UserForm } from "@/app/modules/users/components/UserForm";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["ADMIN"]);
  const query = useUser(id, permitted);
  const { mutateAsync: remove } = useDeleteUser();
  if (!permitted) return <RecordFeedback kind="forbidden" entity="User" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading user editor…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="User" backHref="/dashboard/users" backLabel="Back to users" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="User" backHref="/dashboard/users" backLabel="Back to users" />;

  const record = query.data.data;
  return <div className="min-w-0 space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold text-[var(--text-primary)]">Edit user</h1><p className="mt-1 text-sm leading-7 text-[var(--text-secondary)]">Update the account email. Role assignments and directory links are managed on the detail page.</p></div><Link href={"/dashboard/users/" + encodeURIComponent(record.id)} className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--text-secondary)] underline">View user</Link></div>
    <div className="min-w-0 rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-4 sm:p-6"><UserForm mode="edit" initialData={{ id: record.id, email: record.email }} onDelete={async () => { await remove(record.id); router.push("/dashboard/users"); }} /></div>
  </div>;
}
