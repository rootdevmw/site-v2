import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProgramType } from "../api/createProgramType";

export function useCreateProgramType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createProgramType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["program-types"] });
    },
  });
}
