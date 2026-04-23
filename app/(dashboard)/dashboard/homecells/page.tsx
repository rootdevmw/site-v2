"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useHomecells } from "@/app/modules/homecells/hooks/useHomecells";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { useDeleteHomecell } from "@/app/modules/homecells/hooks/useDeleteHomecell";

import { TableLayout } from "@/components/ui/TableLayout";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";

import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export default function HomecellsPage() {
  const router = useRouter();
  const { mutateAsync: deleteHomecell } = useDeleteHomecell();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useHomecells({
    page,
    limit,
    search: debouncedSearch,
  });

  const homecells = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Homecells"
      description="Manage church homecells"
      actions={
        <button
          onClick={() => router.push("/dashboard/homecells/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Homecell
        </button>
      }
      filters={
        <input
          placeholder="Search homecells..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-64 px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200 bg-[var(--card-elevated)] border border-[var(--border-soft)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-1 focus:ring-[var(--main-gold)] focus:border-[var(--main-gold)]"
        />
      }
      pagination={
        <Pagination
          page={page}
          total={meta?.total || 1}
          limit={meta?.limit ?? 10}
          onPageChange={setPage}
        />
      }
    >
      <Table
        data={homecells}
        isLoading={isLoading}
        emptyMessage="No homecells found"
        columns={[
          { header: "Name", accessor: "name" },
          //  Leader with badge
          {
            header: "Leader",
            render: (hc) =>
              hc.leader ? (
                <div className="flex items-center gap-2">
                  <span>
                    {hc.leader.firstName} {hc.leader.lastName}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--main-gold)] text-black font-medium">
                    Leader
                  </span>
                </div>
              ) : (
                <span className="text-[var(--text-secondary)]">—</span>
              ),
          },

          //  Overseer with badge
          {
            header: "Overseer",
            render: (hc) =>
              hc.overseer ? (
                <div className="flex items-center gap-2">
                  <span>
                    {hc.overseer.firstName} {hc.overseer.lastName}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300">
                    Overseer
                  </span>
                </div>
              ) : (
                <span className="text-[var(--text-secondary)]">—</span>
              ),
          },
        ]}
        onRowClick={(hc) => router.push(`/dashboard/homecells/${hc.id}`)}
        actions={(hc) => (
          <>
            <button
              onClick={() => router.push(`/dashboard/homecells/${hc.id}`)}
              className="px-3 py-1 rounded-md text-sm bg-[var(--blue)] text-black"
            >
              View
            </button>

            <button
              onClick={() => router.push(`/dashboard/homecells/${hc.id}/edit`)}
              className="px-3 py-1 rounded-md text-sm bg-[var(--card-elevated)] text-[var(--text-primary)]"
            >
              Edit
            </button>

            <DeleteConfirmButton
              description={`Delete Homecell ${hc.name}?`}
              onConfirm={() => deleteHomecell(hc.id)}
            />
          </>
        )}
      />
    </TableLayout>
  );
}
