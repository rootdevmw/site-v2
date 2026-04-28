"use client";

import {
  Prayer,
  Visitor,
  AttentionOverviewResponse,
} from "@/app/modules/attention/types/attention.types";
import { Table } from "@/components/ui/Table";
import { TableLayout } from "@/components/ui/TableLayout";
import { api } from "@/lib/api/client";
import { showError, showSuccess } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ManageAttentionPage() {
  const router = useRouter();

  const [data, setData] = useState<AttentionOverviewResponse>({
    prayers: [],
    visitors: [],
  });

  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get("/attention/manage");
      setData(res.data.data);
    } catch {
      showError("Failed to load attention data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ─────────────────────────────
  // ACTIONS
  // ─────────────────────────────
  async function markPrayer(id: string) {
    try {
      await api.post(`/attention/prayers/${id}/prayed`);
      showSuccess("Prayer marked as prayed");
      fetchData();
    } catch {
      showError("Failed to update prayer");
    }
  }

  async function markVisitor(id: string) {
    try {
      await api.post(`/attention/visitors/${id}/ack`);
      showSuccess("Visitor acknowledged");
      fetchData();
    } catch {
      showError("Failed to update visitor");
    }
  }

  return (
    <div className="space-y-8">
      {/* ───────────────────────────── */}
      {/* PRAYERS */}
      {/* ───────────────────────────── */}
      <TableLayout
        title="Prayer Requests"
        description="Click a row to view full request details"
      >
        <Table<Prayer>
          data={data.prayers}
          isLoading={loading}
          emptyMessage="No pending prayer requests"
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
              render: (row) => (
                <span className="text-xs px-2 py-1 rounded bg-orange-500/10 text-orange-400">
                  {row.status}
                </span>
              ),
            },
          ]}
          actions={(row) => (
            <button
              onClick={() => markPrayer(row.id)}
              className="px-3 py-1 text-xs rounded-lg bg-[var(--main-gold)] text-black hover:opacity-90"
            >
              Mark Prayed
            </button>
          )}
        />
      </TableLayout>

      {/* ───────────────────────────── */}
      {/* VISITORS */}
      {/* ───────────────────────────── */}
      <TableLayout
        title="Visitors"
        description="Click a row to view visitor details"
      >
        <Table<Visitor>
          data={data.visitors}
          isLoading={loading}
          emptyMessage="No pending visitors"
          onRowClick={(row) =>
            router.push(`/dashboard/attention/${row.id}/visitors`)
          }
          columns={[
            {
              header: "Name",
              accessor: "name",
            },
            {
              header: "Visit Date",
              accessor: "visitDate",
              render: (row) =>
                new Date(row.visitDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
            },
            {
              header: "Status",
              accessor: "status",
              render: (row) => (
                <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400">
                  {row.status}
                </span>
              ),
            },
          ]}
          actions={(row) => (
            <button
              onClick={() => markVisitor(row.id)}
              className="px-3 py-1 text-xs rounded-lg bg-[var(--main-gold)] text-black hover:opacity-90"
            >
              Acknowledge
            </button>
          )}
        />
      </TableLayout>
    </div>
  );
}
