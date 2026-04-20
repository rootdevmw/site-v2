"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useUsers } from "@/app/modules/users/hooks/useUsers";
import { useDeleteUser } from "@/app/modules/users/hooks/useUserActions";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";

import { TableLayout } from "@/components/ui/TableLayout";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export default function UsersPage() {
  const router = useRouter();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useUsers({
    page,
    limit,
    search: debouncedSearch,
  });

  const users = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Users"
      description="Manage system users"
      actions={
        <button
          onClick={() => router.push("/dashboard/users/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add User
        </button>
      }
      filters={
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <input
            placeholder="Search users..."
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
        data={users}
        isLoading={isLoading}
        emptyMessage="No users found"
        columns={[
          {
            header: "Email",
            accessor: "email",
          },
          {
            header: "Roles",
            render: (u) => u.roles.join(", ") || "None",
          },
          {
            header: "Member",
            render: (u) =>
              u.member ? `${u.member.firstName} ${u.member.lastName}` : "N/A",
          },
        ]}
        onRowClick={(u) => router.push(`/dashboard/users/${u.id}`)}
        actions={(u) => (
          <>
            <button
              onClick={() => router.push(`/dashboard/users/${u.id}`)}
              className="px-3 py-1 rounded-md text-sm bg-[var(--blue)] text-black"
            >
              View
            </button>

            <button
              onClick={() => router.push(`/dashboard/users/${u.id}/edit`)}
              className="px-3 py-1 rounded-md text-sm bg-[var(--card-elevated)] text-[var(--text-primary)]"
            >
              Edit
            </button>

            <DeleteConfirmButton
              description={`Delete user ${u.email}?`}
              onConfirm={() => deleteUser(u.id)}
            />
          </>
        )}
      />
    </TableLayout>
  );
}
