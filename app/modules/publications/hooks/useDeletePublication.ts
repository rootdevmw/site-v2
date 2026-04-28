import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePublication } from "../api/deletePublication";

export function useDeletePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePublication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}
