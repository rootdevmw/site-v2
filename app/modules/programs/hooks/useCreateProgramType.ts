import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProgramType } from "../api/createProgramType";
import { refreshTypeCatalog } from "@/lib/utils/type-catalog-cache";

export function useCreateProgramType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createProgramType,
    retry: false,
    onSettled: () => refreshTypeCatalog(qc, "programs"),
  });
}
