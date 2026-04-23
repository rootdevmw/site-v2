import { useQuery } from "@tanstack/react-query";
import { getAttentionOverview } from "../api/getAttentionOverview";

export function useAttentionOverview() {
  return useQuery({
    queryKey: ["attention-overview"],
    queryFn: getAttentionOverview,
    refetchInterval: 15000,
  });
}
