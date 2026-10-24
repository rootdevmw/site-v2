"use client";
import { useParams, useRouter } from "next/navigation";
import { EventForm } from "@/app/modules/events/components/EventForm";
import { useEvent } from "@/app/modules/events/hooks/useEvent";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useDeleteScheduleRecord } from "@/lib/hooks/useScheduleLists";
import { eventTimeInput } from "@/lib/utils/event-editor";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";
export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const query = useEvent(id, permitted);
  const deletion = useDeleteScheduleRecord("events");
  const router = useRouter();
  if (!permitted) return <RecordFeedback kind="forbidden" entity="Event editor" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading event editor..." />;
  if (query.isError && !query.data?.data) return <RecordLoadError error={query.error} entity="Event" backHref="/dashboard/events" backLabel="Back to events" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  const event = query.data?.data;
  if (!event) return <RecordFeedback kind="missing" entity="Event" backHref="/dashboard/events" backLabel="Back to events" />;
  return <>{query.isError && <p role="alert" className="member-form-summary mb-5">The latest event details could not be checked. Your entries are kept; review the saved event before retrying an uncertain change.</p>}<EventForm key={id} mode="edit" initialData={{ id: event.id, title: event.title, typeId: event.typeId || event.type?.id || "", location: event.location || "", description: event.description || "", startTime: eventTimeInput(event.startTime), endTime: eventTimeInput(event.endTime), ministryIds: event.ministries?.map((entry) => entry.id) || [] }} initialType={event.type} initialMinistries={event.ministries} onDelete={async () => { await deletion.mutateAsync(id); router.push("/dashboard/events"); }} /></>;
}
