"use client";

import { Table } from "@/components/ui/Table";
import { TableLayout } from "@/components/ui/TableLayout";
import { api } from "@/lib/api/client";
import { showError, showSuccess } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Prayer } from "@/app/modules/attention/types/attention.types";

export default function PrayerRequestsPage() {
  const router = useRouter();

  const [data, setData] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get("/attention/prayer-requests");
      setData(res.data.data);
    } catch {
      showError("Failed to load prayer requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function markPrayed(id: string) {
    try {
      await api.post(`/attention/prayers/${id}/prayed`);
      showSuccess("Marked as prayed");
      fetchData();
    } catch {
      showError("Failed to update prayer");
    }
  }

  return (
    <TableLayout
      title="Prayer Requests"
      description="Respond in prayer and mark when completed"
    >
      <Table<Prayer>
        data={data}
        isLoading={loading}
        emptyMessage="No prayer requests found"
        onRowClick={(row) =>
          router.push(`/dashboard/attention/${row.id}/prayers`)
        }
        columns={[
          {
            header: "Name",
            accessor: "name",
            render: (row) => row.name || "Anonymous",
          },
          {
            header: "Prayer For",
            accessor: "prayerFor",
            render: (row) => (
              <span className="font-medium text-[var(--text-primary)]">
                {row.prayerFor}
              </span>
            ),
          },
          {
            header: "Request",
            accessor: "request",
            render: (row) => (
              <span className="line-clamp-1 text-[var(--text-secondary)]">
                {row.request}
              </span>
            ),
          },
          {
            header: "Status",
            accessor: "status",
            render: (row) => {
              const color =
                row.status === "PRAYED_FOR"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-orange-500/10 text-orange-400";

              return (
                <span className={`text-xs px-2 py-1 rounded ${color}`}>
                  {row.status}
                </span>
              );
            },
          },
        ]}
        actions={(row) => (
          <button
            onClick={() => markPrayed(row.id)}
            className="px-3 py-1 text-xs rounded-lg bg-[var(--main-gold)] text-black hover:opacity-90"
          >
            Mark Prayed
          </button>
        )}
      />
    </TableLayout>
  );
}
