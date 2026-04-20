import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteContent } from "../api/deleteContent";

export function useDeleteContent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content"] });
    },
  });
}
