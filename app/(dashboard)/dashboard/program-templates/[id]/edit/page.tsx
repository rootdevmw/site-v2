"use client";
import { useParams, useRouter } from "next/navigation";
import { useProgramTemplate } from "@/app/modules/programTemplates/hooks/useProgramTemplate";
import { ProgramTemplateForm } from "@/app/modules/programTemplates/components/ProgramTemplateForm";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getTemplateEditorValues } from "@/lib/utils/program-records";
import { useDeleteScheduleRecord } from "@/lib/hooks/useScheduleLists";
import {
  RecordFeedback,
  RecordLoadError,
  RecordSkeleton,
} from "@/components/records/RecordLayout";
export default function EditProgramTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useProgramTemplate(id, permitted),
    deletion = useDeleteScheduleRecord("program-templates");
  const router = useRouter();
  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Template editor"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  if (query.isPending)
    return <RecordSkeleton label="Loading template editor..." />;
  if (query.isError && !query.data?.data)
    return (
      <RecordLoadError
        error={query.error}
        entity="Template"
        backHref="/dashboard/program-templates"
        backLabel="Back to templates"
        onRetry={() => {
          void query.refetch();
        }}
        retrying={query.isFetching}
      />
    );
  const template = query.data?.data;
  if (!template)
    return (
      <RecordFeedback
        kind="missing"
        entity="Template"
        backHref="/dashboard/program-templates"
        backLabel="Back to templates"
      />
    );
  const people = template.items.flatMap((item) =>
    item.responsible
      ? [
          {
            id: item.responsible.id,
            name: [item.responsible.firstName, item.responsible.lastName]
              .filter(Boolean)
              .join(" "),
          },
        ]
      : [],
  );
  return (
    <>
      {query.isError && (
        <p role="alert" className="member-form-summary mb-5">
          The latest template details could not be checked. Your entries are
          kept; review the saved template before retrying an uncertain change.
        </p>
      )}
      <ProgramTemplateForm
        key={id}
        mode="edit"
        initialData={getTemplateEditorValues(template)}
        initialType={template.type}
        initialHomecell={template.homecell}
        initialPeople={people}
        onDelete={async () => {
          await deletion.mutateAsync(id);
          router.push("/dashboard/program-templates");
        }}
      />
    </>
  );
}
