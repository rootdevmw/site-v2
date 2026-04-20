import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useDeleteAnnouncement() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
