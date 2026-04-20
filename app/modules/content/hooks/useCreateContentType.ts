import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContentType } from "../api/createContentType";

export function useCreateContentType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createContentType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-types"] });
    },
  });
}
