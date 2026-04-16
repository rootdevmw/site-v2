import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { showError, showSuccess } from "@/lib/toast";

export function useDeleteMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/members/${id}`),
    onSuccess: () => {
      showSuccess("Member deleted");
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => {
      showError("Failed to delete member");
    },
  });
}
