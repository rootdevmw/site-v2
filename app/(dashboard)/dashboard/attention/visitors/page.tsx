"use client";

import { Table } from "@/components/ui/Table";
import { TableLayout } from "@/components/ui/TableLayout";
import { api } from "@/lib/api/client";
import { showError, showSuccess } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Visitor } from "@/app/modules/attention/types/attention.types";

export default function VisitorsPage() {
  const router = useRouter();

  const [data, setData] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get("/attention/visitors");
      setData(res.data.data);
    } catch {
      showError("Failed to load visitors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function acknowledge(id: string) {
    try {
      await api.post(`/attention/visitors/${id}/ack`);
      showSuccess("Visitor acknowledged");
      fetchData();
    } catch {
      showError("Failed to acknowledge visitor");
    }
  }

  return (
    <TableLayout
      title="Visitors"
      description="Follow up and acknowledge first-time visitors"
    >
      <Table<Visitor>
        data={data}
        isLoading={loading}
        emptyMessage="No visitors found"
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
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
          },
          {
            header: "Group Size",
            accessor: "groupSize",
          },
          {
            header: "Status",
            accessor: "status",
            render: (row) => {
              const color =
                row.status === "COMPLETED"
                  ? "bg-green-500/10 text-green-400"
                  : row.status === "CONFIRMED"
                    ? "bg-blue-500/10 text-blue-400"
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
            onClick={() => acknowledge(row.id)}
            className="px-3 py-1 text-xs rounded-lg bg-[var(--main-gold)] text-black hover:opacity-90"
          >
            Acknowledge
          </button>
        )}
      />
    </TableLayout>
  );
}
