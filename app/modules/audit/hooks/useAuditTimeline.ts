import { useQuery } from "@tanstack/react-query";
import { getAuditTimeline } from "../api/audit.api";

export function useAuditTimeline(params: { entity: string; id: string }) {
  return useQuery({
    queryKey: ["audit-timeline", params],
    queryFn: () => getAuditTimeline(params),
  });
}
