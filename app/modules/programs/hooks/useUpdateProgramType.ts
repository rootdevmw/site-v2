import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProgramType } from "../api/updateProgramType";
import { refreshTypeCatalog } from "@/lib/utils/type-catalog-cache";

export function useUpdateProgramType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      updateProgramType(id, data),

    retry: false,
    onSettled: () => refreshTypeCatalog(qc, "programs"),
  });
}
