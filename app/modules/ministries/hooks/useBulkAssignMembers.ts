import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { showSuccess, showError } from "@/lib/toast";

type BulkAssignVariables = {
  ministryId: string;
  memberIds: string[];
};

export function useBulkAssignMembers() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ ministryId, memberIds }: BulkAssignVariables) => {
      await Promise.all(
        memberIds.map((memberId) =>
          api.post(`/ministries/${ministryId}/members`, { memberId }),
        ),
      );
    },
    onSuccess: (_res, vars) => {
      showSuccess(`${vars.memberIds.length} member(s) imported`);
      qc.invalidateQueries({ queryKey: ["ministry-members", vars.ministryId] });
    },
    onError: () => {
      showError("Failed to import members");
    },
  });
}
