import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { showError, showSuccess } from "@/lib/toast";

export function useDeleteHomecell() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/homecells/${id}`),
    onSuccess: () => {
      showSuccess("Homecell deleted");
      qc.invalidateQueries({ queryKey: ["homecells"] });
    },
    onError: () => {
      showError("Failed to delete homecell");
    },
  });
}
