import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { assignImportedMembers } from "@/lib/utils/ministry-import";
import { refreshGroupMembership } from "@/lib/utils/group-membership-cache";

type BulkAssignVariables = { ministryId: string; memberIds: string[] };

export function useBulkAssignMembers() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ ministryId, memberIds }: BulkAssignVariables) =>
      assignImportedMembers(memberIds, (memberId) => api.post("/ministries/" + encodeURIComponent(ministryId) + "/members", { memberId }, { silent: true, timeout: 30000 })),
    onSettled: (_data, _error, variables) =>
      refreshGroupMembership(client, "ministry", variables.ministryId, variables.memberIds),
  });
}
