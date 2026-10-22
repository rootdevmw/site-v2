import { useQuery } from "@tanstack/react-query";
import { getMember } from "../api/getMember";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useMember(id: string, enabled = true) {
  return useQuery({
    queryKey: ["member", id],
    queryFn: ({ signal }) => getMember(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
