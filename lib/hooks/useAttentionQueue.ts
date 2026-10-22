"use client";

import { useQuery } from "@tanstack/react-query";
import { getAttentionQueue } from "@/lib/api/attention-queues";
import { getAccountRoles } from "@/lib/utils/account-records";
import { hasRequiredRole } from "@/lib/auth/roles";
import { attentionQueueFilterError, type AttentionQueueFilters, type AttentionQueueKind } from "@/lib/utils/attention-queues";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useAttentionQueue(kind: AttentionQueueKind, filters: AttentionQueueFilters, user: { id: string; roles: string[] } | null) {
  const roles = getAccountRoles(user?.roles);
  return useQuery({ queryKey: [kind, "attention-queue", user?.id, roles, filters], queryFn: ({ signal }) => getAttentionQueue(kind, filters, signal), enabled: !!user?.id && hasRequiredRole(roles, ["DEACON"]) && !attentionQueueFilterError(kind, filters), staleTime: 30000, refetchOnMount: "always", retry: retryRecordRequest });
}
