"use client";
import { useParams, useRouter } from "next/navigation";
import { HomecellForm } from "@/app/modules/homecells/components/HomecellForm";
import { useHomecell } from "@/app/modules/homecells/hooks/useHomecell";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useDeleteDirectoryRecord } from "@/lib/hooks/useDirectoryRecords";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";
import { GroupEditRefreshNotice } from "@/components/directories/GroupEditRefreshNotice";
export default function EditHomecellPage() {
  const { id } = useParams<{ id: string }>();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const query = useHomecell(id, permitted);
  const deletion = useDeleteDirectoryRecord("homecells");
  const router = useRouter();
  if (!permitted) return <RecordFeedback kind="forbidden" entity="Homecell editor" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading homecell editor…" />;
  if (query.isError && !query.data?.data) return <RecordLoadError error={query.error} entity="Homecell" backHref="/dashboard/homecells" backLabel="Back to homecells" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  const group = query.data?.data;
  if (!group) return <RecordFeedback kind="missing" entity="Homecell" backHref="/dashboard/homecells" backLabel="Back to homecells" />;
  const person = (entry: typeof group.leader) => entry ? { id: entry.id, name: [entry.firstName, entry.lastName].filter(Boolean).join(" ") } : null;
  return <><GroupEditRefreshNotice failed={query.isError} /><HomecellForm key={id} mode="edit" initialData={{ id: group.id, name: group.name, location: group.location || "", leaderId: group.leaderId || group.leader?.id || "", overseerId: group.overseerId || group.overseer?.id || "" }} initialPeople={{ leader: person(group.leader), overseer: person(group.overseer) }} onDelete={async () => { await deletion.mutateAsync(id); router.push("/dashboard/homecells"); }} /></>;
}
