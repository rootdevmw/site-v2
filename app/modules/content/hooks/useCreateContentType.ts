import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContentType } from "../api/createContentType";
import { refreshTypeCatalog } from "@/lib/utils/type-catalog-cache";

export function useCreateContentType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createContentType,
    retry: false,
    onSettled: () => refreshTypeCatalog(qc, "content"),
  });
}
