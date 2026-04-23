"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useProgramTypes } from "@/app/modules/programs/hooks/useProgramTypes";
import { useDeleteProgramType } from "@/app/modules/programs/hooks/useDeleteProgramType";
import { ProgramType } from "@/app/modules/programs/types/program.types";

import { TableLayout } from "@/components/ui/TableLayout";
import { Table } from "@/components/ui/Table";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";
import { Pagination } from "@/components/ui/Pagination";

export default function ProgramTypesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { mutateAsync: deleteType } = useDeleteProgramType();
  const { data, isLoading } = useProgramTypes({ page });

  const types = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Program Types"
      description="Manage program categories"
      actions={
        <button
          onClick={() => router.push("/dashboard/program-types/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black"
        >
          + Add Type
        </button>
      }
    >
      <Table<ProgramType>
        data={types}
        isLoading={isLoading}
        emptyMessage="No program types found"
        columns={[{ header: "Name", accessor: "name" }]}
        actions={(t) => (
          <>
            <button
              onClick={() =>
                router.push(`/dashboard/program-types/${t.id}/edit`)
              }
              className="text-[var(--main-gold)]"
            >
              Edit
            </button>

            <DeleteConfirmButton
              description={`Delete ${t.name}? This cannot be undone.`}
              onConfirm={() => deleteType(t.id)}
            />
          </>
        )}
      />
      <Pagination
        page={page}
        total={meta?.total ?? 0}
        limit={meta?.limit ?? 10}
        onPageChange={setPage}
      />
    </TableLayout>
  );
}
