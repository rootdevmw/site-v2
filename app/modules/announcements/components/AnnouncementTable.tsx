"use client";

import { useRouter } from "next/navigation";
import { Announcement } from "../types/announcement.types";
import { Table } from "@/components/ui/Table";
import { useDeleteAnnouncement } from "../hooks/useDeleteAnnouncement";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export function AnnouncementTable({
  data,
  isLoading,
}: {
  data: Announcement[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { mutateAsync: deleteAnnouncement } = useDeleteAnnouncement();

  return (
    <Table
      data={data}
      isLoading={isLoading}
      emptyMessage="No announcements found"
      columns={[
        { header: "Title", accessor: "title" },
        {
          header: "Description",
          render: (a) => a.description || "No description",
        },
        {
          header: "Priority",
          render: (a) => a.priority || "Normal",
        },
        {
          header: "Published",
          render: (a) =>
            a.publishedAt
              ? new Date(a.publishedAt).toLocaleDateString()
              : "Draft",
        },
        {
          header: "Created",
          render: (a) => new Date(a.createdAt).toLocaleDateString(),
        },
      ]}
      onRowClick={(a) => router.push(`/dashboard/announcements/${a.id}`)}
      actions={(a) => (
        <>
          <button
            onClick={() => router.push(`/dashboard/announcements/${a.id}/edit`)}
            className="text-[var(--main-gold)]"
          >
            Edit
          </button>

          <DeleteConfirmButton
            description={`Delete "${a.title}"? This cannot be undone.`}
            onConfirm={() => deleteAnnouncement(a.id)}
          />
        </>
      )}
    />
  );
}
