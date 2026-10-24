import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStream } from "../api/deleteStream";

export function useDeleteStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStream(id),
    retry: false,
    onSettled: () =>
      Promise.all(
        [
          "streams",
          "stream",
          "audit-logs",
          "audit-timeline",
          "dashboard-overview",
        ].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
      ),
  });
}
