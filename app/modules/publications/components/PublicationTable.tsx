"use client";

import { useRouter } from "next/navigation";
import { Publication } from "../types/publication.types";
import { Table } from "@/components/ui/Table";
import { useDeletePublication } from "../hooks/useDeletePublication";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export function PublicationTable({
  data,
  isLoading,
}: {
  data: Publication[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { mutateAsync: deletePublication } = useDeletePublication();

  return (
    <Table
      data={data}
      isLoading={isLoading}
      emptyMessage="No publications found"
      columns={[
        { header: "Title", accessor: "title" },
        {
          header: "Description",
          render: (n) => n.description || "No description",
        },
        {
          header: "Published",
          render: (n) =>
            n.publishedAt
              ? new Date(n.publishedAt).toLocaleDateString()
              : "Draft",
        },
        {
          header: "Created",
          render: (n) => new Date(n.createdAt).toLocaleDateString(),
        },
      ]}
      onRowClick={(n) => router.push(`/dashboard/publications/${n.id}`)}
      actions={(n) => (
        <>
          <button
            onClick={() => router.push(`/dashboard/publications/${n.id}/edit`)}
            className="text-[var(--main-gold)]"
          >
            Edit
          </button>

          <DeleteConfirmButton
            description={`Delete "${n.title}"? This cannot be undone.`}
            onConfirm={() => deletePublication(n.id)}
          />
        </>
      )}
    />
  );
}
