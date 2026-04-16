import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useDeleteProgramType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/programs/types/${id}`),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["program-types"] });
    },
  });
}
