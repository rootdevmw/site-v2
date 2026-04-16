import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHomecell } from "../api/createHomecell";

export function useCreateHomecell() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createHomecell,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homecells"] });
    },
  });
}
