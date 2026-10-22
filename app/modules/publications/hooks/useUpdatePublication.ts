import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePublication } from "../api/updatePublication";
import type { PublicationEditorPayload } from "@/lib/utils/publication-editor";

export function useUpdatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: PublicationEditorPayload;
    }) => updatePublication(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      queryClient.invalidateQueries({
        queryKey: ["publication", variables.id],
      });
    },
  });
}
