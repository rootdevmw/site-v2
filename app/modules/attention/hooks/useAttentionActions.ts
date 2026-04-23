import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markPrayer } from "../api/markPrayer";
import { markVisitor } from "../api/markVisitor";

export function useAttentionActions() {
  const qc = useQueryClient();

  const prayerMutation = useMutation({
    mutationFn: markPrayer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prayers"] });
      qc.invalidateQueries({ queryKey: ["attention-overview"] });
    },
  });

  const visitorMutation = useMutation({
    mutationFn: markVisitor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
      qc.invalidateQueries({ queryKey: ["attention-overview"] });
    },
  });

  return {
    markPrayer: prayerMutation,
    markVisitor: visitorMutation,
  };
}
