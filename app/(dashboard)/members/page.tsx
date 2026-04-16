"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useMembers } from "@/app/modules/members/hooks/useMembers";
import { useDeleteMember } from "@/app/modules/members/hooks/useDeleteMember";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";

import { TableLayout } from "@/components/ui/TableLayout";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export default function MembersPage() {
  const router = useRouter();
  const { mutateAsync: deleteMember } = useDeleteMember();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useMembers({
    page,
    limit,
    search: debouncedSearch,
    status,
  });

  const members = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Members"
      description="Manage church members"
      actions={
        <button
          onClick={() => router.push("/members/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Member
        </button>
      }
      filters={
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <input
            placeholder="Search members..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-64 px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200 bg-[var(--card-elevated)] border border-[var(--border-soft)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-1 focus:ring-[var(--main-gold)] focus:border-[var(--main-gold)]"
          />

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200 bg-[var(--card-elevated)] border border-[var(--border-soft)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--main-gold)] focus:border-[var(--main-gold)]"
          >
            <option value="">All Status</option>
            <option value="Visitor">Visitor</option>
            <option value="Member">Member</option>
            <option value="Baptized">Baptized</option>
          </select>
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
        data={members}
        isLoading={isLoading}
        emptyMessage="No members found"
        columns={[
          {
            header: "Name",
            render: (m) => `${m.firstName} ${m.lastName}`,
          },
          { header: "Phone", accessor: "phone" },
          { header: "Status", accessor: "status" },
          { header: "Location", accessor: "location" },
        ]}
        onRowClick={(m) => router.push(`/members/${m.id}`)}
        actions={(m) => (
          <>
            <button
              onClick={() => router.push(`/members/${m.id}`)}
              className="px-3 py-1 rounded-md text-sm bg-[var(--blue)] text-black"
            >
              View
            </button>

            <button
              onClick={() => router.push(`/members/${m.id}/edit`)}
              className="px-3 py-1 rounded-md text-sm bg-[var(--card-elevated)] text-[var(--text-primary)]"
            >
              Edit
            </button>

            <DeleteConfirmButton
              description={`Delete ${m.firstName} ${m.lastName}?`}
              onConfirm={() => deleteMember(m.id)}
            />
          </>
        )}
      />
    </TableLayout>
  );
}
