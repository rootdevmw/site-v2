import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPublication } from "../api/createPublication";
import type { PublicationEditorPayload } from "@/lib/utils/publication-editor";

export function useCreatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublicationEditorPayload) => createPublication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}
