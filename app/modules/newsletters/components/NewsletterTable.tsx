"use client";

import { useRouter } from "next/navigation";
import { Newsletter } from "../types/newsletter.types";
import { Table } from "@/components/ui/Table";
import { useDeleteNewsletter } from "../hooks/useDeleteNewsletter";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export function NewsletterTable({
  data,
  isLoading,
}: {
  data: Newsletter[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { mutateAsync: deleteNewsletter } = useDeleteNewsletter();

  return (
    <Table
      data={data}
      isLoading={isLoading}
      emptyMessage="No newsletters found"
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
      onRowClick={(n) => router.push(`/dashboard/newsletters/${n.id}`)}
      actions={(n) => (
        <>
          <button
            onClick={() => router.push(`/dashboard/newsletters/${n.id}/edit`)}
            className="text-[var(--main-gold)]"
          >
            Edit
          </button>

          <DeleteConfirmButton
            description={`Delete "${n.title}"? This cannot be undone.`}
            onConfirm={() => deleteNewsletter(n.id)}
          />
        </>
      )}
    />
  );
}
