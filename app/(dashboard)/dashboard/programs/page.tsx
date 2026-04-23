"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { usePrograms } from "@/app/modules/programs/hooks/usePrograms";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";

import { TableLayout } from "@/components/ui/TableLayout";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { DateInput } from "@/components/ui/DateInput";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";
import { useDeleteProgram } from "@/app/modules/programs/hooks/useDeleteProgram";

export default function ProgramsPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [date, setDate] = useState("");
  const debouncedDate = useDebounce(date);
  const { mutateAsync: deleteProgram } = useDeleteProgram();

  const { data, isLoading } = usePrograms({
    page,
    limit,
    date: debouncedDate,
  });

  const programs = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Programs"
      description="Manage church programs and schedules"
      actions={
        <button
          onClick={() => router.push("/dashboard/programs/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Program
        </button>
      }
      filters={
        <DateInput
          label="Date"
          value={date || ""}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
        />
      }
      pagination={
        <Pagination
          page={page}
          total={meta?.total ?? 0}
          limit={meta?.limit ?? 10}
          onPageChange={setPage}
        />
      }
    >
      <Table
        data={programs}
        isLoading={isLoading}
        emptyMessage="No programs found"
        columns={[
          { header: "Date", accessor: "date" },
          { header: "Type", render: (p) => p.type?.name },
          { header: "Items", render: (p) => p.items?.length },
        ]}
        onRowClick={(p) => router.push(`/dashboard/programs/${p.id}`)}
        actions={(p) => (
          <>
            <button
              onClick={() => router.push(`/dashboard/programs/${p.id}/edit`)}
              className="text-[var(--main-gold)]"
            >
              Edit
            </button>

            <DeleteConfirmButton
              description={`Delete program with ID ${p.id}? This cannot be undone.`}
              onConfirm={() => deleteProgram(p.id)}
            />
          </>
        )}
      />
    </TableLayout>
  );
}
