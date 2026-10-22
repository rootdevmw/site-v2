import { useQuery } from "@tanstack/react-query";
import { getMinistry } from "../api/getMinistry";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useMinistry(id: string, enabled = true) {
  return useQuery({
    queryKey: ["ministry", id],
    queryFn: ({ signal }) => getMinistry(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
