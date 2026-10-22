"use client";
import { useParams, useRouter } from "next/navigation";
import { MinistryForm } from "@/app/modules/ministries/components/MinistryForm";
import { useMinistry } from "@/app/modules/ministries/hooks/useMinistry";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useDeleteDirectoryRecord } from "@/lib/hooks/useDirectoryRecords";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";
import { GroupEditRefreshNotice } from "@/components/directories/GroupEditRefreshNotice";
export default function EditMinistryPage() {
  const { id } = useParams<{ id: string }>();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const query = useMinistry(id, permitted);
  const deletion = useDeleteDirectoryRecord("ministries");
  const router = useRouter();
  if (!permitted) return <RecordFeedback kind="forbidden" entity="Ministry editor" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading ministry editor…" />;
  if (query.isError && !query.data?.data) return <RecordLoadError error={query.error} entity="Ministry" backHref="/dashboard/ministries" backLabel="Back to ministries" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  const group = query.data?.data;
  if (!group) return <RecordFeedback kind="missing" entity="Ministry" backHref="/dashboard/ministries" backLabel="Back to ministries" />;
  const person = (entry: typeof group.leader) => entry ? { id: entry.id, name: [entry.firstName, entry.lastName].filter(Boolean).join(" ") } : null;
  return <><GroupEditRefreshNotice failed={query.isError} /><MinistryForm key={id} mode="edit" initialData={{ id: group.id, name: group.name, purpose: group.purpose || "", description: group.description || "", leaderId: group.leaderId || group.leader?.id || "", overseerId: group.overseerId || group.overseer?.id || "" }} initialPeople={{ leader: person(group.leader), overseer: person(group.overseer) }} onDelete={async () => { await deletion.mutateAsync(id); router.push("/dashboard/ministries"); }} /></>;
}
