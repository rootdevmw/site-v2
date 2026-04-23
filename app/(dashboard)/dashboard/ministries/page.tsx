"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useMinistries } from "@/app/modules/ministries/hooks/useMinistries";
import { useMembers } from "@/app/modules/members/hooks/useMembers";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { useDeleteMinistry } from "@/app/modules/ministries/hooks/useDeleteMinistry";

import { TableLayout } from "@/components/ui/TableLayout";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

import {
  Ministry,
  MinistryMember,
} from "@/app/modules/ministries/types/ministry.types";

export default function MinistriesPage() {
  const router = useRouter();
  const { mutateAsync: deleteMinistry } = useDeleteMinistry();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [overseerId, setOverseerId] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useMinistries({
    page,
    limit,
    search: debouncedSearch,
    leaderId,
    overseerId,
  });

  const { data: membersData } = useMembers({
    page: 1,
    limit: 100,
  });

  const ministries = (data?.data || []) as Ministry[];
  const meta = data?.meta;

  const leaders = membersData?.data || [];

  return (
    <TableLayout
      title="Ministries"
      description="Manage church ministries"
      actions={
        <button
          onClick={() => router.push("/dashboard/ministries/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium 
          bg-[var(--main-gold)] text-black 
          hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Ministry
        </button>
      }
      filters={
        <div className="flex gap-4 flex-wrap items-end">
          {/* Search */}
          <div className="w-full max-w-64">
            <Input
              label="Search"
              placeholder="Search ministries..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Leader */}
          <div className="w-full max-w-64">
            <Select
              label="Leader"
              value={leaderId}
              onChange={(e) => {
                setLeaderId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Leaders</option>

              {leaders.map((m: MinistryMember, index: number) => (
                <option key={m.id ?? index} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </Select>
          </div>

          {/* Overseer */}
          <div className="w-full max-w-64">
            <Select
              label="Overseer"
              value={overseerId}
              onChange={(e) => {
                setOverseerId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Overseers</option>

              {leaders.map((m: MinistryMember, index: number) => (
                <option key={m.id ?? index} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </Select>
          </div>
        </div>
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
        data={ministries}
        isLoading={isLoading}
        emptyMessage="No ministries found"
        columns={[
          { header: "Name", accessor: "name" },

          {
            header: "Leader",
            render: (m) =>
              m.leader ? `${m.leader.firstName} ${m.leader.lastName}` : "-",
          },

          {
            header: "Overseer",
            render: (m) =>
              m.overseer
                ? `${m.overseer.firstName} ${m.overseer.lastName}`
                : "-",
          },
        ]}
        onRowClick={(m) => router.push(`/dashboard/ministries/${m.id}`)}
        actions={(m) => (
          <>
            <button
              onClick={() => router.push(`/dashboard/ministries/${m.id}`)}
              className="px-3 py-1 rounded-md text-sm 
              bg-[var(--blue)] text-black"
            >
              View
            </button>

            <button
              onClick={() => router.push(`/dashboard/ministries/${m.id}/edit`)}
              className="px-3 py-1 rounded-md text-sm 
              bg-[var(--card-elevated)] text-[var(--text-primary)]"
            >
              Edit
            </button>

            <DeleteConfirmButton
              description={`Delete ${m.name}? This cannot be undone.`}
              onConfirm={() => deleteMinistry(m.id)}
            />
          </>
        )}
      />
    </TableLayout>
  );
}
