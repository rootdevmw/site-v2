import { useQuery } from "@tanstack/react-query";
import { getHomecell } from "../api/getHomecell";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useHomecell(id: string, enabled = true) {
  return useQuery({
    queryKey: ["homecell", id],
    queryFn: ({ signal }) => getHomecell(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
