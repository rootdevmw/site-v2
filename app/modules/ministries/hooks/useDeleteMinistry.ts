import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { showError, showSuccess } from "@/lib/toast";

export function useDeleteMinistry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/ministries/${id}`),
    onSuccess: () => {
      showSuccess("Ministry deleted");
      qc.invalidateQueries({ queryKey: ["ministries"] });
    },
    onError: () => {
      showError("Failed to delete ministry");
    },
  });
}
