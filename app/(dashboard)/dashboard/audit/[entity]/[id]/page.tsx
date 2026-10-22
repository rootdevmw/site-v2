"use client";

import { useParams } from "next/navigation";
import { useAuditTimeline } from "@/app/modules/audit/hooks/useAuditTimeline";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getAuditEntity } from "@/config/audit-entities";
import { AuditRecordView } from "@/components/records/AuditRecordView";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export default function AuditDetailPage() {
  const { entity, id } = useParams<{ entity: string; id: string }>();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["ADMIN"]);
  const query = useAuditTimeline({ entity, id }, permitted);
  if (!permitted) return <RecordFeedback kind="forbidden" entity="Audit history" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading record history…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Audit history" backHref="/dashboard/audit" backLabel="Back to audit" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  const context = getAuditEntity(entity);
  return <AuditRecordView key={context.key + ":" + id} entity={entity} id={id} entries={query.data ?? []} canOpenRecord={hasRequiredRole(actor?.roles ?? [], context.roles ?? ["ROOT"])} />;
}
