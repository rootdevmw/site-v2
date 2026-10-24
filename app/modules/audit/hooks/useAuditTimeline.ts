import { useQuery } from "@tanstack/react-query";
import { getAuditTimeline } from "../api/audit.api";
import { getAuditEntity } from "@/config/audit-entities";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useAuditTimeline(params: { entity: string; id: string }, enabled = true) {
  return useQuery({
    queryKey: ["audit-timeline", getAuditEntity(params.entity).key, params.id],
    queryFn: ({ signal }) => getAuditTimeline(params, signal),
    enabled: !!params.entity && !!params.id && enabled,
    retry: retryRecordRequest,
  });
}
