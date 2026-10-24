import { useQuery } from "@tanstack/react-query";
import { getProgram } from "../api/getProgram";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useProgram(id: string, enabled = true) {
  return useQuery({
    queryKey: ["program", id],
    queryFn: ({ signal }) => getProgram(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
