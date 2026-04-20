"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStreams } from "@/app/modules/streams/hooks/useStreams";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { StreamTable } from "@/app/modules/streams/components/StreamTable";

import { TableLayout } from "@/components/ui/TableLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";

export default function StreamsPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useStreams({
    page,
    limit,
    search: debouncedSearch,
  });

  const streams = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Streams"
      description="Manage live streams and broadcasting platforms"
      actions={
        <button
          onClick={() => router.push("/dashboard/streams/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Stream
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
          totalPages={meta?.totalPages || 1}
          onPageChange={setPage}
        />
      }
    >
      <StreamTable data={streams} isLoading={isLoading} />
    </TableLayout>
  );
}
