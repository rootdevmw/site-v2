"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvent } from "@/app/modules/events/hooks/useEvent";
import { useDeleteEvent } from "@/app/modules/events/hooks/useDeleteEvent";
import type { Ministry } from "@/app/modules/events/types/event.types";
import { showSuccess, showError } from "@/lib/toast";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useEvent(id as string);
  const { mutateAsync: deleteEvent } = useDeleteEvent();

  if (isLoading) {
    return <SpiritualLoader message="Loading event..." />;
  }

  const event = data?.data;

  if (!event) {
    return <div>Event not found</div>;
  }

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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {event.title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Event Details</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/events/${id}/edit`)}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--card-elevated)] hover:bg-[var(--card-bg)]"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            Delete
          </button>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--card-elevated)]"
          >
            Back
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              Title
            </label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {event.title}
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Type</label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {event.type?.name || "—"}
            </p>
          </div>

          {/* Start */}
          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              Start Date & Time
            </label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {event.startTime
                ? new Date(event.startTime).toLocaleString()
                : "—"}
            </p>
          </div>

          {/* End */}
          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              End Date & Time
            </label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {event.endTime ? new Date(event.endTime).toLocaleString() : "—"}
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              Location
            </label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {event.location || "—"}
            </p>
          </div>

          {/* Created */}
          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              Created
            </label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {new Date(event.createdAt!).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-[var(--text-secondary)]">
            Description
          </label>
          <p className="text-sm text-[var(--text-primary)] mt-1 whitespace-pre-line">
            {event.description || "—"}
          </p>
        </div>

        {/* Ministries */}
        <div>
          <label className="text-xs text-[var(--text-secondary)]">
            Ministries
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {event.ministries!.length > 0 ? (
              event.ministries!.map((m: Ministry) => (
                <span
                  key={m.id}
                  className="px-2 py-1 rounded-md text-xs bg-[var(--main-gold)] text-black"
                >
                  {m.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--text-secondary)]">
                None assigned
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
