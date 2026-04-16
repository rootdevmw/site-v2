import { api } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProgramTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/program-templates/${id}`),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["program-templates"] });
    },
  });
}
