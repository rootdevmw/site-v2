import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignMember } from "../api/assignMember";

export function useAssignMember(homecellId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => assignMember({ homecellId, memberId }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homecell-members", homecellId] });
      qc.invalidateQueries({ queryKey: ["members"] }); // important (override)
    },
  });
}
