import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePublication } from "../api/deletePublication";

export function useDeletePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePublication(id),
    retry: false,
    onSettled: () =>
      Promise.all(
        [
          "publications",
          "publication",
          "audit-logs",
          "audit-timeline",
          "dashboard-overview",
        ].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
      ),
  });
}
