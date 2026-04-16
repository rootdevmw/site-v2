import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProgramTemplate } from "../api/createProgramTemplate";

export function useCreateProgramTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createProgramTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["program-templates"] });
    },
  });
}
