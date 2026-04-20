"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useRoles } from "@/app/modules/roles/hooks/useRoles";
import { useDeleteRole } from "@/app/modules/roles/hooks/useRoleActions";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";

import { TableLayout } from "@/components/ui/TableLayout";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export default function RolesPage() {
  const router = useRouter();
  const { mutateAsync: deleteRole } = useDeleteRole();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useRoles({
    page,
    limit,
  });

  const roles = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Roles"
      description="Manage user roles"
      actions={
        <button
          onClick={() => router.push("/dashboard/roles/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Role
        </button>
      }
      filters={
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <input
            placeholder="Search roles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-64 px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200 bg-[var(--card-elevated)] border border-[var(--border-soft)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-1 focus:ring-[var(--main-gold)] focus:border-[var(--main-gold)]"
          />
        </div>
      }
      pagination={
        <Pagination
          page={page}
          totalPages={meta?.totalPages || 1}
          onPageChange={setPage}
        />
      }
    >
      <Table
        data={roles}
        isLoading={isLoading}
        emptyMessage="No roles found"
        columns={[
          {
            header: "Name",
            accessor: "name",
          },
        ]}
        onRowClick={(r) => router.push(`/dashboard/roles/${r.id}`)}
        actions={(r) => (
          <>
            <button
              onClick={() => router.push(`/dashboard/roles/${r.id}`)}
              className="px-3 py-1 rounded-md text-sm bg-[var(--blue)] text-black"
            >
              View
            </button>

            <button
              onClick={() => router.push(`/dashboard/roles/${r.id}/edit`)}
              className="px-3 py-1 rounded-md text-sm bg-[var(--card-elevated)] text-[var(--text-primary)]"
            >
              Edit
            </button>

            <DeleteConfirmButton
              description={`Delete role ${r.name}?`}
              onConfirm={() => deleteRole(r.id)}
            />
          </>
        )}
      />
    </TableLayout>
  );
}
