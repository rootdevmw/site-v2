import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStream } from "../api/createStream";
import { StreamFormValues } from "../types/stream.types";

export function useCreateStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StreamFormValues) => createStream(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
  });
}
