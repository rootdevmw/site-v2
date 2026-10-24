"use client";

import { useParams } from "next/navigation";
import { useRole } from "@/app/modules/roles/hooks/useRoleActions";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { RoleRecordView } from "@/components/records/RoleRecordView";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["ROOT"]);
  const query = useRole(id, permitted);
  if (!permitted) return <RecordFeedback kind="forbidden" entity="Role" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading role…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Role" backHref="/dashboard/roles" backLabel="Back to roles" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Role" backHref="/dashboard/roles" backLabel="Back to roles" />;
  return <RoleRecordView role={query.data.data} />;
}
