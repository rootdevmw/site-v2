"use client";

import { useRouter } from "next/navigation";
import { EventForm } from "@/app/modules/events/components/EventForm";

export default function NewEventPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Add Event
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create new church event
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <EventForm
          mode="create"
          initialData={{}}
          onSuccess={() => router.push("/dashboard/events")}
        />
      </div>
    </div>
  );
}
