import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProgramType } from "../api/updateProgramType";

export function useUpdateProgramType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      updateProgramType(id, data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["program-types"] });
      qc.invalidateQueries({
        queryKey: ["program-types", variables.id],
      });
    },
  });
}
