import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStream } from "../api/deleteStream";

export function useDeleteStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStream(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
  });
}
