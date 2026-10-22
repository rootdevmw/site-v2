import { useQuery } from "@tanstack/react-query";
import { getEvent } from "../api/getEvent";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useEvent(id: string, enabled = true) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: ({ signal }) => getEvent(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
