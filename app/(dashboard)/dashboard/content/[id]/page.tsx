"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { useContent } from "@/app/modules/content/hooks/useContent";
import { usePublishContent } from "@/app/modules/content/hooks/usePublishContent";
import { ContentRecordView } from "@/components/records/ContentRecordView";
import { getContentState } from "@/lib/utils/editorial-records";

export default function ContentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["MEDIA"]);
  const query = useContent(id, permitted);
  const mutation = usePublishContent();

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Content" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading content…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Content" backHref="/dashboard/content" backLabel="Back to content" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Content" backHref="/dashboard/content" backLabel="Back to content" />;

  const content = query.data.data;
  const { next } = getContentState(content.status);
  const publishing = next === "Published";
  return <ContentRecordView content={content} authorLinkAllowed={hasRequiredRole(user?.roles ?? [], ["DEACON"])} publishingAction={next && <RecordActionDialog
    actionKey={content.id + ":" + content.status} label={publishing ? "Publish message" : "Unpublish"} title={publishing ? "Publish this message?" : "Unpublish this message?"}
    description={publishing ? "This will make “" + content.title + "” available on the public church website." : "This will return “" + content.title + "” to draft and remove it from public message listings."}
    pendingLabel={publishing ? "Publishing…" : "Unpublishing…"} successMessage={publishing ? "The message is published." : "The message is now a draft."}
    onConfirm={() => mutation.mutateAsync({ id: content.id, status: next })} busy={mutation.isPending || query.isFetching} secondary={!publishing}
  />} />;
}
