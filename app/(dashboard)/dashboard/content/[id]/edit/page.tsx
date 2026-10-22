"use client";
import { useParams, useRouter } from "next/navigation";
import { ContentForm } from "@/app/modules/content/components/ContentForm";
import { useContent } from "@/app/modules/content/hooks/useContent";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useDeleteEditorialRecord } from "@/lib/hooks/useEditorialLists";
import { contentEditorValues } from "@/lib/utils/content-editor";
import {
  RecordFeedback,
  RecordLoadError,
  RecordSkeleton,
} from "@/components/records/RecordLayout";
export default function EditContentPage() {
  const { id } = useParams<{ id: string }>(),
    router = useRouter();
  const actor = useAuthStore((state) => state.user),
    permitted = hasRequiredRole(actor?.roles ?? [], ["MEDIA"]);
  const query = useContent(id, permitted),
    deletion = useDeleteEditorialRecord("content");
  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Content editor"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  if (query.isPending)
    return <RecordSkeleton label="Loading content editor..." />;
  if (query.isError && !query.data?.data)
    return (
      <RecordLoadError
        error={query.error}
        entity="Content"
        backHref="/dashboard/content"
        backLabel="Back to content"
        onRetry={() => {
          void query.refetch();
        }}
        retrying={query.isFetching}
      />
    );
  const content = query.data?.data;
  if (!content)
    return (
      <RecordFeedback
        kind="missing"
        entity="Content"
        backHref="/dashboard/content"
        backLabel="Back to content"
      />
    );
  const author = content.author
    ? {
        id: content.author.id,
        name: [content.author.firstName, content.author.lastName]
          .filter(Boolean)
          .join(" "),
      }
    : null;
  return (
    <>
      {query.isError && (
        <p className="member-form-summary mb-5" role="alert">
          The latest message details could not be checked. Your entries are
          kept; review the saved message before retrying an uncertain change.
        </p>
      )}
      <ContentForm
        key={id}
        mode="edit"
        initialData={contentEditorValues(content)}
        initialType={content.type}
        initialAuthor={author}
        status={content.status}
        onDelete={async () => {
          await deletion.mutateAsync(id);
          router.push("/dashboard/content");
        }}
      />
    </>
  );
}
