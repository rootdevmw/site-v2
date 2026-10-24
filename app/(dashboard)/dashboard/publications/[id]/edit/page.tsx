"use client";
import { useParams, useRouter } from "next/navigation";
import { PublicationForm } from "@/app/modules/publications/components/PublicationForm";
import { usePublication } from "@/app/modules/publications/hooks/usePublication";
import { useDeletePublication } from "@/app/modules/publications/hooks/useDeletePublication";
import { showSuccess, showError } from "@/lib/toast";
import {
  RecordFeedback,
  RecordLoadError,
  RecordSkeleton,
} from "@/components/records/RecordLayout";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";

export default function EditPublicationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["MEDIA"]);
  const { data, isPending, isError, error, refetch, isFetching } =
    usePublication(id, permitted);
  const { mutateAsync: deletePublication } = useDeletePublication();
  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Publication"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  if (isPending)
    return <RecordSkeleton label="Loading publication editor..." />;
  if (isError && !data?.data)
    return (
      <RecordLoadError
        error={error}
        entity="Publication"
        backHref="/dashboard/publications"
        backLabel="Back to publications"
        onRetry={() => {
          void refetch();
        }}
        retrying={isFetching}
      />
    );
  const publication = data?.data;
  if (!publication)
    return (
      <RecordFeedback
        kind="missing"
        entity="Publication"
        backHref="/dashboard/publications"
        backLabel="Back to publications"
      />
    );
  async function handleDelete() {
    try {
      await deletePublication(id);
      showSuccess("Publication deleted successfully");
      router.push("/dashboard/publications");
    } catch (error) {
      showError(
        "Publication deletion could not be confirmed. Review the list before retrying.",
      );
      throw error;
    }
  }
  return (
    <>
      {isError && (
        <p role="alert" className="content-editor-notice mb-6">
          The latest record could not be loaded. Your current editor is kept.
          Review the saved publication before retrying a save.
        </p>
      )}
      <PublicationForm
        key={publication.id}
        mode="edit"
        initialData={publication}
        onDelete={handleDelete}
      />
    </>
  );
}
