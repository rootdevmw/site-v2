"use client";

import { useParams, useRouter } from "next/navigation";
import { AnnouncementForm } from "@/app/modules/announcements/components/AnnouncementForm";
import { useAnnouncement } from "@/app/modules/announcements/hooks/useAnnouncement";
import { useDeleteAnnouncement } from "@/app/modules/announcements/hooks/useDeleteAnnouncement";
import { showSuccess, showError } from "@/lib/toast";

export default function EditAnnouncementPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useAnnouncement(id as string);
  const { mutateAsync: deleteAnnouncement } = useDeleteAnnouncement();

  if (isLoading) return <div>Loading...</div>;

  const announcement = data?.data;

  // Transform announcement data to match form values
  const formData = announcement
    ? {
        ...announcement,
        targetIds: announcement.targets?.map((t: any) => t.id) || [],
      }
    : undefined;

  const handleDelete = async () => {
    try {
      await deleteAnnouncement(id as string);
      showSuccess("Announcement deleted successfully");
      router.push("/announcements");
    } catch {
      showError("Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Edit Announcement
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Update announcement details
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <AnnouncementForm
          mode="edit"
          initialData={formData}
          onSuccess={() => router.push("/announcements")}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
