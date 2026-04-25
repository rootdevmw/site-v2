"use client";

import { useRouter } from "next/navigation";
import { Content } from "../types/content.types";
import { Table } from "@/components/ui/Table";
import { useDeleteContent } from "../hooks/useDeleteContent";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export function ContentTable({
  data,
  isLoading,
}: {
  data: Content[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { mutateAsync: deleteContent } = useDeleteContent();
  return (
    <Table
      data={data}
      isLoading={isLoading}
      emptyMessage="No content found"
      columns={[
        { header: "Title", accessor: "title" },
        { header: "Type", render: (c) => c.type?.name },
        {
          header: "Author",
          render: (c) => `${c.author?.firstName} ${c.author?.lastName}`,
        },
        { header: "Status", accessor: "status" },
        {
          header: "Created",
          render: (c) => new Date(c.createdAt).toLocaleDateString(),
        },
      ]}
      onRowClick={(c) => router.push(`/dashboard/content/${c.id}`)}
      actions={(c) => (
        <>
          <button
            onClick={() => router.push(`/dashboard/content/${c.id}/edit`)}
            className="text-[var(--main-gold)]"
          >
            Edit
          </button>

          <DeleteConfirmButton
            description={`Delete "${c.title}"? This cannot be undone.`}
            onConfirm={() => deleteContent(c.id)}
          />
        </>
      )}
    />
  );
}
