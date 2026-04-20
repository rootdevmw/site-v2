import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContent } from "../api/createContent";

export function useCreateContent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content"] });
    },
  });
}
