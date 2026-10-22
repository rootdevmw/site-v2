"use client";

import { useParams, useRouter } from "next/navigation";
import { StreamForm } from "@/app/modules/streams/components/StreamForm";
import { useStream } from "@/app/modules/streams/hooks/useStream";
import { useDeleteStream } from "@/app/modules/streams/hooks/useDeleteStream";
import { showSuccess, showError } from "@/lib/toast";
import {
  RecordFeedback,
  RecordLoadError,
  RecordSkeleton,
} from "@/components/records/RecordLayout";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";

export default function EditStreamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["MEDIA"]);
  const { data, isPending, isError, error, refetch, isFetching } = useStream(
    id,
    permitted,
  );
  const { mutateAsync: deleteStream } = useDeleteStream();

  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Stream"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  if (isPending) return <RecordSkeleton label="Loading stream editor…" />;
  if (isError && !data?.data)
    return (
      <RecordLoadError
        error={error}
        entity="Stream"
        backHref="/dashboard/streams"
        backLabel="Back to streams"
        onRetry={() => {
          void refetch();
        }}
        retrying={isFetching}
      />
    );

  const stream = data?.data;
  if (!stream)
    return (
      <RecordFeedback
        kind="missing"
        entity="Stream"
        backHref="/dashboard/streams"
        backLabel="Back to streams"
      />
    );

  const handleDelete = async () => {
    try {
      await deleteStream(id);
      showSuccess("Stream deleted successfully");
      router.push("/dashboard/streams");
    } catch (deleteError) {
      showError(
        "Stream deletion could not be confirmed. Review the list before retrying.",
      );
      throw deleteError;
    }
  };

  return (
    <>
      {isError && (
        <p role="alert" className="content-editor-notice mb-6">
          The latest record could not be loaded. Your current editor is kept.
          Review the saved stream before retrying a save.
        </p>
      )}
      <StreamForm
        key={stream.id}
        mode="edit"
        initialData={stream}
        onDelete={handleDelete}
      />
    </>
  );
}
