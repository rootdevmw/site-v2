import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { showSuccess, showError } from "@/lib/toast";

type MinistryMemberVariables = {
  ministryId: string;
  memberId: string;
};

export function useAssignMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ ministryId, memberId }: MinistryMemberVariables) =>
      api.post(`/ministries/${ministryId}/members`, {
        memberId,
      }),

    onSuccess: (_res, vars) => {
      showSuccess("Member added");
      qc.invalidateQueries({
        queryKey: ["ministry-members", vars.ministryId],
      });
    },

    onError: () => {
      showError("Failed to assign member");
    },
  });
}
