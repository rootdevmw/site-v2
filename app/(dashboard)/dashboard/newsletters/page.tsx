"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNewsletters } from "@/app/modules/newsletters/hooks/useNewsletters";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { NewsletterTable } from "@/app/modules/newsletters/components/NewsletterTable";

import { TableLayout } from "@/components/ui/TableLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";

export default function NewslettersPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useNewsletters({
    page,
    limit,
    search: debouncedSearch,
  });

  const newsletters = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Newsletters"
      description="Manage church newsletters and publications"
      actions={
        <button
          onClick={() => router.push("/dashboard/newsletters/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Newsletter
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
      <NewsletterTable data={newsletters} isLoading={isLoading} />
    </TableLayout>
  );
}
