"use client";

import { useParams, useRouter } from "next/navigation";
import { EventForm } from "@/app/modules/events/components/EventForm";
import { useEvent } from "@/app/modules/events/hooks/useEvent";
import { useDeleteEvent } from "@/app/modules/events/hooks/useDeleteEvent";
import type { Ministry } from "@/app/modules/events/types/event.types";
import { showSuccess, showError } from "@/lib/toast";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useEvent(id as string);
  const { mutateAsync: deleteEvent } = useDeleteEvent();

  if (isLoading) return <SpiritualLoader message="Loading Events..." />;

  const event = data?.data;

  // Transform event data to match form values
  const formData = event
    ? {
        ...event,
        typeId: event.type?.id ?? event.typeId,
        ministryIds: event.ministries?.map((m: Ministry) => m.id) || [],
      }
    : undefined;

  const handleDelete = async () => {
    try {
      await deleteEvent(id as string);
      showSuccess("Event deleted successfully");
      router.push("/dashboard/events");
    } catch {
      showError("Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Edit Event
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Update event details
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <EventForm
          mode="edit"
          initialData={formData}
          onSuccess={() => router.push("/events")}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
