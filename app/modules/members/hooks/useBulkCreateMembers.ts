import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { MemberFormValues } from "../types/member.types";
import { showSuccess, showError } from "@/lib/toast";

type BulkCreateVariables = {
  members: MemberFormValues[];
};

export function useBulkCreateMembers() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ members }: BulkCreateVariables) => {
      await Promise.all(members.map((data) => api.post("/members", data)));
    },
    onSuccess: (_res, vars) => {
      showSuccess(`${vars.members.length} member(s) created`);
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => {
      showError("Failed to import members");
    },
  });
}
