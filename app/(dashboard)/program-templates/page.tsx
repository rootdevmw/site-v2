"use client";

import { useRouter } from "next/navigation";

import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";
import { Table } from "@/components/ui/Table";
import { TableLayout } from "@/components/ui/TableLayout";
import { useProgramTemplates } from "@/app/modules/programTemplates/hooks/useProgramTemplates";
import { useDeleteProgramTemplate } from "@/app/modules/programTemplates/hooks/useDeleteProgramTemplate";
import { ProgramTemplate } from "@/app/modules/programTemplates/types/programTemplate.types";

export default function TemplatesPage() {
  const router = useRouter();
  const { mutateAsync: deleteProgramTemplate } = useDeleteProgramTemplate();

  const { data, isLoading } = useProgramTemplates();

  const templates = data?.data || [];

  return (
    <TableLayout
      title="Program Templates"
      description="Reusable program structures"
      actions={
        <button
          onClick={() => router.push("/program-templates/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Template
        </button>
      }
    >
      <Table<ProgramTemplate>
        data={templates}
        isLoading={isLoading}
        emptyMessage="No templates yet"
        columns={[
          { header: "Name", accessor: "name" },
          { header: "Type", render: (t) => t.type?.name },
          { header: "Items", render: (t) => t.items?.length },
        ]}
        onRowClick={(t) => router.push(`/program-templates/${t.id}`)}
        actions={(t) => (
          <>
            <button onClick={() => router.push(`/program-templates/${t.id}`)}>
              View
            </button>

            <button
              onClick={() => router.push(`/program-templates/${t.id}/edit`)}
            >
              Edit
            </button>
            <DeleteConfirmButton
              triggerLabel="Delete"
              title="Delete template"
              description={`Are you sure you want to delete "${t.name}"? This action cannot be undone.`}
              confirmLabel="Delete"
              cancelLabel="Cancel"
              onConfirm={() => deleteProgramTemplate(t.id)}
              className="text-red-400 hover:bg-red-500/20"
            />
          </>
        )}
      />
    </TableLayout>
  );
}
