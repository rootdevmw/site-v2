import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateContent } from "../api/updateContent";

export function useUpdateContent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateContent(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["content"] });
      qc.invalidateQueries({ queryKey: ["content", id] });
    },
  });
}
