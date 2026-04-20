"use client";

import { useRouter } from "next/navigation";
import { StreamForm } from "@/app/modules/streams/components/StreamForm";

export default function NewStreamPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Add Stream
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create new live stream
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <StreamForm
          mode="create"
          initialData={{}}
          onSuccess={() => router.push("/dashboard/streams")}
        />
      </div>
    </div>
  );
}
