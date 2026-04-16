import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMember } from "../api/removeMember";

export function useRemoveMember(homecellId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeMember({ homecellId, memberId }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homecell-members", homecellId] });
    },
  });
}
