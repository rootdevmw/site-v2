import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api/audit.api";

function normalizeEntity(entity: string) {
  return entity
    .trim()
    .replace(/-/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase();
}

export function useAuditLogs(params: {
  entity: string;
  entityId?: string;
  page: number;
  limit?: number;
  action?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [
      "audit-logs",
      normalizeEntity(params.entity),
      params.page,
      params.limit,
      params.action,
      params.search,
    ],

    queryFn: () =>
      getAuditLogs({
        ...params,
        entity: normalizeEntity(params.entity),
        limit: params.limit ?? 10,
      }),

    placeholderData: (prev) => prev,
  });
}
