"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAccessRecord, getAccessList, getAuditList } from "@/lib/api/access-lists";
import { getAuditEntity } from "@/config/audit-entities";
import { retryRecordRequest } from "@/lib/utils/record-details";
import { refreshAccountRecord, refreshRoleDefinition } from "@/lib/utils/account-cache";
import type { AccessFilters, AccessKind, AuditFilters } from "@/lib/utils/access-lists";

export function useAccessList(kind: AccessKind, filters: AccessFilters, enabled: boolean) {
  return useQuery({ queryKey: [kind, "management-list", filters], queryFn: ({ signal }) => getAccessList(kind, filters, signal), enabled, staleTime: 30000, retry: retryRecordRequest });
}
export function useAuditList(entity: string, filters: AuditFilters, enabled: boolean) {
  const canonical = getAuditEntity(entity).key;
  return useQuery({ queryKey: ["audit-logs", canonical, "management-list", filters], queryFn: ({ signal }) => getAuditList(canonical, filters, signal), enabled, staleTime: 30000, retry: retryRecordRequest });
}
export function useDeleteAccessRecord(kind: AccessKind) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteAccessRecord(kind, id), retry: false,
    onSettled: (_data, _error, id) => kind === "roles" ? refreshRoleDefinition(client, id) : refreshAccountRecord(client, id),
  });
}
