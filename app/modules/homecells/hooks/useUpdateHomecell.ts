import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateHomecell } from "../api/updateHomecell";

export function useUpdateHomecell() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateHomecell,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["homecells"] });
      qc.invalidateQueries({ queryKey: ["homecell", variables.id] });
    },
  });
}
