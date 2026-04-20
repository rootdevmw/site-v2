import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAnnouncement } from "../api/createAnnouncement";

export function useCreateAnnouncement() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
