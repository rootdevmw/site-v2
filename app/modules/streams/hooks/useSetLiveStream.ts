import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setLiveStream } from "../api/setLiveStream";

export function useSetLiveStream() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: setLiveStream,
    retry: false,
    onMutate: () => client.cancelQueries({ queryKey: ["stream"] }),
    onSuccess: (result, id) => {
      client.setQueryData(["stream", id], result);
    },
    // Setting this stream live switches all other streams off, including cached details.
    onSettled: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["stream"] }),
        client.invalidateQueries({ queryKey: ["streams"] }),
        client.invalidateQueries({ queryKey: ["audit-logs"] }),
        client.invalidateQueries({ queryKey: ["audit-timeline"] }),
        client.invalidateQueries({ queryKey: ["dashboard-overview"] }),
      ]),
  });
}
