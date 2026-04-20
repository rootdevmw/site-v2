"use client";

import { useRouter } from "next/navigation";
import { AnnouncementForm } from "@/app/modules/announcements/components/AnnouncementForm";

export default function NewAnnouncementPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Add Announcement
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create new church announcement
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <AnnouncementForm
          mode="create"
          initialData={{}}
          onSuccess={() => router.push("/dashboard/announcements")}
        />
      </div>
    </div>
  );
}
