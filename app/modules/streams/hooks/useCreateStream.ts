import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStream } from "../api/createStream";
import type { StreamEditorPayload } from "@/lib/utils/stream-editor";

export function useCreateStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StreamEditorPayload) => createStream(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
  });
}
