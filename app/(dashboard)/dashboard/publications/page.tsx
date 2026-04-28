"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePublications } from "@/app/modules/publications/hooks/usePublications";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { PublicationTable } from "@/app/modules/publications/components/PublicationTable";

import { TableLayout } from "@/components/ui/TableLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";

export default function PublicationsPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = usePublications({
    page,
    limit,
    search: debouncedSearch,
  });

  const publications = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Publications"
      description="Manage church publications and publications"
      actions={
        <button
          onClick={() => router.push("/dashboard/publications/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Publications
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
      <PublicationTable data={publications} isLoading={isLoading} />
    </TableLayout>
  );
}
