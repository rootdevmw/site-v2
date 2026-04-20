import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEvent } from "../api/updateEvent";

export function useUpdateEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateEvent(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event", id] });
    },
  });
}
