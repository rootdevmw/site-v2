"use client";

import { useParams } from "next/navigation";
import { useMinistry } from "@/app/modules/ministries/hooks/useMinistry";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { CsvMemberUpload } from "@/app/modules/ministries/components/CsvMemberUpload";
import { GroupMembersPanel } from "@/components/records/GroupMembersPanel";
import { MinistryRecordView } from "@/components/records/MinistryRecordView";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export default function MinistryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useMinistry(id, permitted);

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Ministry" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading ministry…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Ministry" backHref="/dashboard/ministries" backLabel="Back to ministries" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Ministry" backHref="/dashboard/ministries" backLabel="Back to ministries" />;

  const ministry = query.data.data;
  return <MinistryRecordView ministry={ministry} membership={
    <GroupMembersPanel key={ministry.id} kind="ministry" groupId={ministry.id} groupName={ministry.name} members={ministry.members} refreshing={query.isFetching}
      importAction={<CsvMemberUpload ministryId={ministry.id} assignedIds={new Set(ministry.members.map((member) => member.id))} disabled={query.isFetching} />}
    />
  } />;
}
