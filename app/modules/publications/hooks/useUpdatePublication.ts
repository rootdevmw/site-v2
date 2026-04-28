import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePublication } from "../api/updatePublication";
import { PublicationFormValues } from "../types/publication.types";

export function useUpdatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PublicationFormValues }) =>
      updatePublication(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      queryClient.invalidateQueries({
        queryKey: ["publication", variables.id],
      });
    },
  });
}
