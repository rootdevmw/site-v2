"use client";

import { useRouter } from "next/navigation";
import { Stream } from "../types/stream.types";
import { Table } from "@/components/ui/Table";
import { useDeleteStream } from "../hooks/useDeleteStream";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export function StreamTable({
  data,
  isLoading,
}: {
  data: Stream[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { mutateAsync: deleteStream } = useDeleteStream();

  return (
    <Table
      data={data}
      isLoading={isLoading}
      emptyMessage="No streams found"
      columns={[
        { header: "Title", accessor: "title" },
        {
          header: "Status",
          render: (s) => (s.isLive ? "Live" : "Scheduled"),
        },
        {
          header: "Starts At",
          render: (s) =>
            s.startsAt ? new Date(s.startsAt).toLocaleString() : "TBD",
        },
        {
          header: "Platforms",
          render: (s) => s.platforms.map((p) => p.name).join(", ") || "None",
        },
        {
          header: "Created",
          render: (s) => new Date(s.createdAt).toLocaleDateString(),
        },
      ]}
      onRowClick={(s) => router.push(`/dashboard/streams/${s.id}`)}
      actions={(s) => (
        <>
          <button
            onClick={() => router.push(`/dashboard/streams/${s.id}/edit`)}
            className="text-[var(--main-gold)]"
          >
            Edit
          </button>

          <DeleteConfirmButton
            description={`Delete "${s.title}"? This cannot be undone.`}
            onConfirm={() => deleteStream(s.id)}
          />
        </>
      )}
    />
  );
}
