"use client";

import { useProgramTemplate } from "@/app/modules/programTemplates/hooks/useProgramTemplate";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { ProgramTemplateRecordView } from "@/components/records/ProgramTemplateRecordView";
import { CreateProgramFromTemplateDialog } from "@/components/records/CreateProgramFromTemplateDialog";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export function ProgramTemplateDetailsClient({ id }: { id: string }) {
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useProgramTemplate(id, permitted);

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Template" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading template…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Template" backHref="/dashboard/program-templates" backLabel="Back to templates" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Template" backHref="/dashboard/program-templates" backLabel="Back to templates" />;

  const template = query.data.data;
  return <ProgramTemplateRecordView template={template} useTemplateAction={<CreateProgramFromTemplateDialog key={template.id} template={template} refreshing={query.isFetching} />} />;
}
