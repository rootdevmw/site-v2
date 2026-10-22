"use client";
import { useParams, useRouter } from "next/navigation";
import { useProgram } from "@/app/modules/programs/hooks/useProgram";
import { ProgramForm } from "@/app/modules/programs/components/ProgramForm";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getProgramEditorValues } from "@/lib/utils/program-records";
import { useDeleteScheduleRecord } from "@/lib/hooks/useScheduleLists";
import {
  RecordFeedback,
  RecordLoadError,
  RecordSkeleton,
} from "@/components/records/RecordLayout";
export default function EditProgramPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useProgram(id, permitted),
    deletion = useDeleteScheduleRecord("programs");
  const router = useRouter();
  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Program editor"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  if (query.isPending)
    return <RecordSkeleton label="Loading program editor..." />;
  if (query.isError && !query.data?.data)
    return (
      <RecordLoadError
        error={query.error}
        entity="Program"
        backHref="/dashboard/programs"
        backLabel="Back to programs"
        onRetry={() => {
          void query.refetch();
        }}
        retrying={query.isFetching}
      />
    );
  const program = query.data?.data;
  if (!program)
    return (
      <RecordFeedback
        kind="missing"
        entity="Program"
        backHref="/dashboard/programs"
        backLabel="Back to programs"
      />
    );
  return (
    <>
      {query.isError && (
        <p role="alert" className="member-form-summary mb-5">
          The latest program details could not be checked. Your entries are
          kept; review the saved program before retrying an uncertain change.
        </p>
      )}
      <ProgramForm
        key={id}
        mode="edit"
        initialData={getProgramEditorValues(program)}
        onDelete={async () => {
          await deletion.mutateAsync(id);
          router.push("/dashboard/programs");
        }}
      />
    </>
  );
}
