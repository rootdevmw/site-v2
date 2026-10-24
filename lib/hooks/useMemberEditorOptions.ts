"use client";
import { useQuery } from "@tanstack/react-query";
import { getMemberEditorOptions } from "@/lib/api/member-editor";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getAccountRoles } from "@/lib/utils/account-records";
import { retryRecordRequest } from "@/lib/utils/record-details";
export function useMemberEditorOptions(kind: "homecells" | "ministries", actor: { id: string; roles: string[] } | null) {
  const roles = getAccountRoles(actor?.roles);
  return useQuery({ queryKey: [kind, "member-editor-options", actor?.id, roles], queryFn: ({ signal }) => getMemberEditorOptions(kind, signal), enabled: !!actor?.id && hasRequiredRole(roles, ["DEACON"]), staleTime: 30000, retry: retryRecordRequest });
}
