import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPublication } from "../api/createPublication";
import { PublicationFormValues } from "../types/publication.types";

export function useCreatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublicationFormValues) => createPublication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}
