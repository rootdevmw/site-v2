import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProgram } from "../api/updateProgram";

export function useUpdateProgram() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateProgram,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      qc.invalidateQueries({ queryKey: ["program", variables.id] });
    },
  });
}
