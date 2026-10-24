import { useQuery } from "@tanstack/react-query";
import { getPrayer } from "../api/getPrayer";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useGetPrayer(id: string, enabled = true) {
  return useQuery({
    queryKey: ["prayer", id],
    queryFn: ({ signal }) => getPrayer(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
