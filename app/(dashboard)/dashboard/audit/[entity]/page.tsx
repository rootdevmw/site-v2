"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { TableLayout } from "@/components/ui/TableLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuditLogs } from "@/app/modules/audit/hooks/useAuditLogs";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";

function actionColor(action: string) {
  if (action.includes("CREAT") || action.includes("ADD"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (action.includes("DELET") || action.includes("REMOV"))
    return "bg-red-50 text-red-700 border-red-200";
  if (action.includes("UPDAT") || action.includes("EDIT"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-[var(--hover-soft)] text-[var(--text-secondary)] border-[var(--border-soft)]";
}

function formatAction(action: string) {
  return action
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AuditEntityPage() {
  const { entity } = useParams();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useAuditLogs({
    entity: String(entity),
    page,
    search: debouncedSearch,
    action,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0 };

  const getChangeSummary = (log: any): string => {
    const before = log.before;
    const after = log.after;
    if (!before || !after) return "";
    const nameFields = ["name", "firstName", "title"];
    for (const key of nameFields) {
      const b = before[key];
      const a = after[key];
      if ((b || a) && b !== a) {
        return `${b ?? "—"} → ${a ?? "—"}`;
      }
    }
    return "";
  };

  return (
    <TableLayout
      title={String(entity)}
      description="Audit trail for all changes"
      filters={
        <div className="space-y-3">
          <Input
            label="Search Entity ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            label="Action"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All actions</option>
            <option value="CREATED">Created</option>
            <option value="UPDATED">Updated</option>
            <option value="DELETED">Deleted</option>
          </Select>
        </div>
      }
      pagination={
        <Pagination
          page={page}
          total={meta.total}
          limit={meta.limit}
          onPageChange={setPage}
        />
      }
    >
      <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] divide-y divide-[var(--border-soft)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-soft)] border-t-[var(--text-secondary)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                Loading audit trail…
              </p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              No audit logs found
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          logs.map((log: any) => {
            const summary = getChangeSummary(log);
            return (
              <button
                key={log.id}
                onClick={() =>
                  router.push(`/dashboard/audit/${entity}/${log.entityId}`)
                }
                className="group w-full text-left px-5 py-4 hover:bg-[var(--hover-soft)] transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div className="shrink-0 w-10 text-center pt-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {formatDate(log.createdAt).split(" ")[1]}
                    </p>
                    <p className="text-lg font-bold leading-none text-[var(--text-primary)]">
                      {new Date(log.createdAt).getDate()}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="mt-1 h-8 w-px shrink-0 bg-[var(--border-soft)]" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${actionColor(log.action)}`}
                      >
                        {formatAction(log.action)}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        ID{" "}
                        <span className="font-semibold text-[var(--text-primary)]">
                          #{log.entityId}
                        </span>
                      </span>
                    </div>

                    {summary && (
                      <p className="mt-1.5 text-sm text-[var(--text-primary)] truncate">
                        {summary}
                      </p>
                    )}
                  </div>

                  {/* Time + arrow */}
                  <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatTime(log.createdAt)}
                    </p>
                    <span className="text-xs text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </TableLayout>
  );
}
