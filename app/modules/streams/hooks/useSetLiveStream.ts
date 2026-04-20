import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setLiveStream } from "../api/setLiveStream";

export function useSetLiveStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setLiveStream(id),
    onSuccess: (result, id) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      queryClient.invalidateQueries({ queryKey: ["stream", id] });
    },
  });
}
