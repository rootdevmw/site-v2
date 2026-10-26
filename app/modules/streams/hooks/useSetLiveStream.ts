import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setLiveStream, endLiveStream } from "../api/setLiveStream";
import { liveQueryKey, type LiveSnapshot } from "@/lib/public-api/live";

export function useSetLiveStream(action: "start" | "end" = "start") {
  const client = useQueryClient();
  return useMutation({
    mutationFn: action === "end" ? endLiveStream : setLiveStream,
    retry: false,
    onMutate: () => client.cancelQueries({ queryKey: ["stream"] }),
    onSuccess: (result, id) => {
      client.setQueryData(["stream", id], result);
      if (result.data.isLive === false)
        client.setQueryData<LiveSnapshot>(liveQueryKey, (previous) =>
          previous?.broadcast?.id === id
            ? { state: "offline", broadcast: null, checkedAt: Date.now() }
            : previous,
        );
    },
    // Setting this stream live switches all other streams off, including cached details.
    onSettled: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["stream"] }),
        client.invalidateQueries({ queryKey: ["streams"] }),
        client.invalidateQueries({ queryKey: ["audit-logs"] }),
        client.invalidateQueries({ queryKey: ["audit-timeline"] }),
        client.invalidateQueries({ queryKey: ["dashboard-overview"] }),
        client.invalidateQueries({ queryKey: liveQueryKey }),
      ]),
  });
}
