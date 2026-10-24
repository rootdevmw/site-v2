"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import {
  RecordFeedback,
  RecordLoadError,
  RecordSkeleton,
} from "@/components/records/RecordLayout";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { useStream } from "@/app/modules/streams/hooks/useStream";
import { useSetLiveStream } from "@/app/modules/streams/hooks/useSetLiveStream";
import { StreamRecordView } from "@/components/records/StreamRecordView";
import { streamLiveSelectionIssue } from "@/lib/utils/stream-editor";

export default function StreamDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["MEDIA"]);
  const query = useStream(id, permitted);
  const mutation = useSetLiveStream();

  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Stream"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  if (query.isPending) return <RecordSkeleton label="Loading stream…" />;
  if (query.isError)
    return (
      <RecordLoadError
        error={query.error}
        entity="Stream"
        backHref="/dashboard/streams"
        backLabel="Back to streams"
        onRetry={() => {
          void query.refetch();
        }}
        retrying={query.isFetching}
      />
    );
  if (!query.data?.data)
    return (
      <RecordFeedback
        kind="missing"
        entity="Stream"
        backHref="/dashboard/streams"
        backLabel="Back to streams"
      />
    );

  const stream = query.data.data;
  const selectionIssue = streamLiveSelectionIssue(stream);
  return (
    <StreamRecordView
      stream={stream}
      broadcastAction={
        !stream.isLive &&
        (!selectionIssue ? (
          <RecordActionDialog
            actionKey={stream.id + ":" + stream.isLive}
            label="Set live"
            title="Make this the live broadcast?"
            description={
              "“" +
              stream.title +
              "” will become the church’s live broadcast. Any other stream currently marked live will be switched off. A future start delays its appearance on Watch online. This does not start a broadcast on YouTube or another platform."
            }
            confirmLabel="Set as live broadcast"
            pendingLabel="Setting live…"
            successMessage="This stream is now the live broadcast."
            onConfirm={() => mutation.mutateAsync(stream.id)}
            busy={mutation.isPending || query.isFetching}
          />
        ) : (
          <p className="record-empty">{selectionIssue}</p>
        ))
      }
    />
  );
}
