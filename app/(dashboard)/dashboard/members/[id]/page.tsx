"use client";

import { useParams } from "next/navigation";
import { useMember } from "@/app/modules/members/hooks/useMember";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { MemberRecordView } from "@/components/records/MemberRecordView";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export default function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useMember(id, permitted);

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Member" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading member profile…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Member" backHref="/dashboard/members" backLabel="Back to members" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Member" backHref="/dashboard/members" backLabel="Back to members" />;

  return <MemberRecordView member={query.data.data} />;
}
