"use client";

import { useRouter } from "next/navigation";
import { Event } from "../types/event.types";
import { Table } from "@/components/ui/Table";
import { useDeleteEvent } from "../hooks/useDeleteEvent";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export function EventTable({
  data,
  isLoading,
}: {
  data: Event[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { mutateAsync: deleteEvent } = useDeleteEvent();

  return (
    <Table
      data={data}
      isLoading={isLoading}
      emptyMessage="No events found"
      columns={[
        { header: "Title", accessor: "title" },
        { header: "Type", render: (e) => e.type?.name },
        {
          header: "Ministries",
          render: (e) => e.ministries?.map((m) => m.name).join(", ") || "All",
        },
        {
          header: "Date",
          render: (e) =>
            e.startTime ? new Date(e.startTime).toLocaleDateString() : "TBD",
        },
        {
          header: "Created",
          render: (e) =>
            e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "-",
        },
      ]}
      onRowClick={(e) => router.push(`/dashboard/events/${e.id}`)}
      actions={(e) => (
        <>
          <button
            onClick={() => router.push(`/dashboard/events/${e.id}/edit`)}
            className="text-[var(--main-gold)]"
          >
            Edit
          </button>

          <DeleteConfirmButton
            description={`Delete "${e.title}"? This cannot be undone.`}
            onConfirm={() => deleteEvent(e.id)}
          />
        </>
      )}
    />
  );
}
