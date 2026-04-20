import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAnnouncement } from "../api/updateAnnouncement";

export function useUpdateAnnouncement() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateAnnouncement(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["announcement", id] });
    },
  });
}
