import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProgramTemplate } from "../api/updateProgramTemplate";

export function useUpdateProgramTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateProgramTemplate,

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["program-templates"] });

      qc.invalidateQueries({
        queryKey: ["program-template", variables.id],
      });
    },
  });
}
