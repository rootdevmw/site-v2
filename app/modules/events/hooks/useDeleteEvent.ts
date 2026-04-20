import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useDeleteEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
