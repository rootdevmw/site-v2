import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNewsletter } from "../api/deleteNewsletter";

export function useDeleteNewsletter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNewsletter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
    },
  });
}
