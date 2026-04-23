"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAnnouncements } from "@/app/modules/announcements/hooks/useAnnouncements";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { AnnouncementTable } from "@/app/modules/announcements/components/AnnouncementTable";

import { TableLayout } from "@/components/ui/TableLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";

export default function AnnouncementsPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useAnnouncements({
    page,
    limit,
    search: debouncedSearch,
  });

  const announcements = data?.data || [];
  const meta = data?.meta;

  return (
    <TableLayout
      title="Announcements"
      description="Manage church announcements and notifications"
      actions={
        <button
          onClick={() => router.push("/dashboard/announcements/new")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Announcement
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
      <AnnouncementTable data={announcements} isLoading={isLoading} />
    </TableLayout>
  );
}
