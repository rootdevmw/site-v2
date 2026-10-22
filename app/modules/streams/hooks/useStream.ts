import { useQuery } from "@tanstack/react-query";
import { getStream } from "../api/getStream";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useStream(id: string, enabled = true) {
  return useQuery({
    queryKey: ["stream", id],
    queryFn: ({ signal }) => getStream(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
