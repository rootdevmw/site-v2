import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { MemberFormValues } from "../types/member.types";
import { showError, showSuccess } from "@/lib/toast";

export function useUpdateMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberFormValues }) =>
      api.patch(`/members/${id}`, data),

    onSuccess: (_res, variables) => {
      showSuccess("Member updated successfully");

      // Refresh members list
      qc.invalidateQueries({ queryKey: ["members"] });

      // Refresh this specific member
      qc.invalidateQueries({ queryKey: ["member", variables.id] });
    },
    onError: () => {
      showError("Failed to update member");
    },
  });
}
