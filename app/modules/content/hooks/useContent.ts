import { useQuery } from "@tanstack/react-query";
import { getContent } from "../api/getContent";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useContent(id: string, enabled = true) {
  return useQuery({
    queryKey: ["content", id],
    queryFn: ({ signal }) => getContent(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
