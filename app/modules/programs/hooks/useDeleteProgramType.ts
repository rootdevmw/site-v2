import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCatalogProgramType } from "@/lib/api/type-catalogs";
import { refreshTypeCatalog } from "@/lib/utils/type-catalog-cache";

export function useDeleteProgramType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteCatalogProgramType,
    retry: false,
    onSettled: () => refreshTypeCatalog(qc, "programs"),
  });
}
