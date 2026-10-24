"use client";

import { useProgram } from "@/app/modules/programs/hooks/useProgram";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { ProgramRecordView } from "@/components/records/ProgramRecordView";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export function ProgramDetailsClient({ id }: { id: string }) {
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useProgram(id, permitted);

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Program" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading program…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Program" backHref="/dashboard/programs" backLabel="Back to programs" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Program" backHref="/dashboard/programs" backLabel="Back to programs" />;

  return <ProgramRecordView program={query.data.data} />;
}
