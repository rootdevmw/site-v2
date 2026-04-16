import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useDeleteProgram() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/programs/${id}`),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
    },
  });
}
