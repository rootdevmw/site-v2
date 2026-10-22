"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGroupLeadershipPage, saveGroupEditor } from "@/lib/api/group-editor";
import type { GroupKind } from "@/lib/utils/group-members";
import type { GroupEditorValues } from "@/lib/utils/group-editor";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getAccountRoles } from "@/lib/utils/account-records";
import { retryRecordRequest } from "@/lib/utils/record-details";
export function useGroupLeadership(filters: { page: number; search: string }, actor: { id: string; roles: string[] } | null) {
  const roles = getAccountRoles(actor?.roles);
  return useQuery({ queryKey: ["members", "group-leadership-options", actor?.id, roles, filters], queryFn: ({ signal }) => getGroupLeadershipPage(filters, signal), enabled: !!actor?.id && hasRequiredRole(roles, ["DEACON"]) && filters.search.length <= 200, staleTime: 30000, refetchOnMount: "always", retry: retryRecordRequest });
}
export function useSaveGroupEditor(kind: GroupKind) {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id?: string; data: Partial<GroupEditorValues> }) => saveGroupEditor(kind, data, id), retry: false, onSettled: () => Promise.all(["ministries", "ministry", "ministry-members", "homecells", "homecell", "homecell-members", "members", "member", "events", "event", "programs", "program", "program-templates", "program-template", "audit-logs", "audit-timeline", "dashboard-overview"].map((key) => client.invalidateQueries({ queryKey: [key] }))) });
}
