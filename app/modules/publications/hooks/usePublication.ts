import { useQuery } from "@tanstack/react-query";
import { getPublication } from "../api/getPublication";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function usePublication(id: string, enabled = true) {
  return useQuery({
    queryKey: ["publication", id],
    queryFn: ({ signal }) => getPublication(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
