"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { usePublication } from "@/app/modules/publications/hooks/usePublication";
import { usePublishPublication, useUnpublishPublication } from "@/app/modules/publications/hooks/usePublishPublication";
import { PublicationRecordView } from "@/components/records/PublicationRecordView";
import { getPublicationFile } from "@/lib/utils/editorial-records";

export default function PublicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["MEDIA"]);
  const query = usePublication(id, permitted);
  const publish = usePublishPublication();
  const unpublish = useUnpublishPublication();

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Publication" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading publication…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Publication" backHref="/dashboard/publications" backLabel="Back to publications" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Publication" backHref="/dashboard/publications" backLabel="Back to publications" />;

  const publication = query.data.data;
  const published = !!publication.publishedAt;
  return <PublicationRecordView publication={publication} publishingAction={published || getPublicationFile(publication.fileUrl).href ? <RecordActionDialog
    actionKey={publication.id + ":" + publication.publishedAt} label={published ? "Unpublish" : "Publish publication"} title={published ? "Unpublish this publication?" : "Publish this publication?"}
    description={published ? "This will remove “" + publication.title + "” from the public publications list." : "This will add “" + publication.title + "” and its attached file to the public publications list."}
    pendingLabel={published ? "Unpublishing…" : "Publishing…"} successMessage={published ? "The publication is now a draft." : "The publication is published."}
    onConfirm={() => published ? unpublish.mutateAsync(publication.id) : publish.mutateAsync(publication.id)}
    busy={publish.isPending || unpublish.isPending || query.isFetching} secondary={published}
  /> : <p className="record-empty">Attach a document before publishing.</p>} />;
}
