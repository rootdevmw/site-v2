"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEvent } from "@/app/modules/events/hooks/useEvent";
import { useDeleteEvent } from "@/app/modules/events/hooks/useDeleteEvent";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { showSuccess } from "@/lib/toast";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";
import { EventRecordView } from "@/components/records/EventRecordView";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useEvent(id, permitted);
  const deletion = useDeleteEvent();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!permitted) return;
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, [permitted]);

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Event" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading event details…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Event" backHref="/dashboard/events" backLabel="Back to events" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Event" backHref="/dashboard/events" backLabel="Back to events" />;

  const event = query.data.data;
  return <EventRecordView event={event} now={now} deleteAction={
    <DeleteConfirmButton
      triggerLabel="Delete event" title="Delete this event?"
      description={'Delete "' + event.title + '"? It will be removed from the church calendar. This cannot be undone.'}
      disabled={deletion.isPending}
      className="flex min-h-11 w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
      onConfirm={async () => {
        await deletion.mutateAsync(event.id);
        showSuccess("Event deleted successfully");
        router.replace("/dashboard/events");
      }}
    />
  } />;
}
