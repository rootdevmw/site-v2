import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markPrayer } from "../api/markPrayer";
import { markVisitor } from "../api/markVisitor";

export function useAttentionActions() {
  const qc = useQueryClient();
  const refresh = (kind: "prayers" | "visitors", id: string) => Promise.all([[kind], [kind === "prayers" ? "prayer" : "visitor", id], ["attention-overview"], ["attention", "notifications"], ["dashboard-overview", "care"], ["audit-logs"], ["audit-timeline"]].map((queryKey) => qc.invalidateQueries({ queryKey })));

  const prayerMutation = useMutation({
    mutationFn: markPrayer,
    retry: false,
    onSuccess: (response, id) => {
      qc.setQueryData(["prayer", id], response.data);
      return refresh("prayers", id);
    },
    onError: (_error, id) => {
      // Re-read the status if the server saved the action before a later failure.
      return refresh("prayers", id);
    },
  });

  const visitorMutation = useMutation({
    mutationFn: markVisitor,
    retry: false,
    onSuccess: (response, id) => {
      qc.setQueryData(["visitor", id], response.data);
      return refresh("visitors", id);
    },
    onError: (_error, id) => {
      return refresh("visitors", id);
    },
  });

  return {
    markPrayer: prayerMutation,
    markVisitor: visitorMutation,
  };
}
