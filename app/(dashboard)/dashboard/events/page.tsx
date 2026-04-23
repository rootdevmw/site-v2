"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/app/modules/events/hooks/useEvents";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { EventTable } from "@/app/modules/events/components/EventTable";

import { TableLayout } from "@/components/ui/TableLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function EventsPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useEvents({
    page,
    limit,
    search: debouncedSearch,
  });

  const events = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Events"
      description="Manage church events and gatherings"
      actions={
        <button
          onClick={() => router.push("/dashboard/events/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Event
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
      <EventTable data={events} isLoading={isLoading} />
    </TableLayout>
  );
}
