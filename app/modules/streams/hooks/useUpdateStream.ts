import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStream } from "../api/updateStream";
import { StreamFormValues } from "../types/stream.types";

export function useUpdateStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StreamFormValues }) =>
      updateStream(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      queryClient.invalidateQueries({ queryKey: ["stream", variables.id] });
    },
  });
}
