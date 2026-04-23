"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContents } from "@/app/modules/content/hooks/useContents";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { ContentTable } from "@/app/modules/content/components/ContentTable";

import { TableLayout } from "@/components/ui/TableLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function ContentPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useContents({
    page,
    limit,
    search: debouncedSearch,
    status,
  });

  const content = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Content"
      description="Manage church content, sermons, and resources"
      actions={
        <button
          onClick={() => router.push("/dashboard/content/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Content
        </button>
      }
      filters={
        <div className="space-y-3">
          <Input
            label="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title..."
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </Select>
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
      <ContentTable data={content} isLoading={isLoading} />
    </TableLayout>
  );
}
