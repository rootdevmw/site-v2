import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStream } from "../api/updateStream";
import type { StreamEditorPayload } from "@/lib/utils/stream-editor";

export function useUpdateStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StreamEditorPayload }) =>
      updateStream(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      queryClient.invalidateQueries({ queryKey: ["stream", variables.id] });
    },
  });
}
