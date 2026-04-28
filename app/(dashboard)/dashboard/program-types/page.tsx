"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useProgramTypes } from "@/app/modules/programs/hooks/useProgramTypes";
import { useDeleteProgramType } from "@/app/modules/programs/hooks/useDeleteProgramType";
import { useUpdateProgramType } from "@/app/modules/programs/hooks/useUpdateProgramType";
import { ProgramType } from "@/app/modules/programs/types/program.types";

import { TableLayout } from "@/components/ui/TableLayout";
import { Table } from "@/components/ui/Table";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";
import { Pagination } from "@/components/ui/Pagination";

function InlineNameCell({ type }: { type: ProgramType }) {
  const { mutateAsync: updateType } = useUpdateProgramType();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(type.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === type.name) {
      setValue(type.name);
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateType({ id: type.id, data: { name: trimmed } });
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setValue(type.name);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        disabled={saving}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={onKeyDown}
        className="w-full rounded-md border border-[var(--main-gold)] bg-[var(--card-elevated)] px-2 py-1 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--main-gold)] disabled:opacity-50"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to edit"
      className="group flex items-center gap-2 text-left text-sm text-[var(--text-primary)]"
    >
      {type.name}
      <svg
        className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-40"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

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
        columns={[
          {
            header: "Name",
            render: (t) => <InlineNameCell type={t} />,
          },
        ]}
        actions={(t) => (
          <DeleteConfirmButton
            description={`Delete ${t.name}? This cannot be undone.`}
            onConfirm={() => deleteType(t.id)}
          />
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
