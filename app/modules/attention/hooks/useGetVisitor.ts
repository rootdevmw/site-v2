import { useQuery } from "@tanstack/react-query";
import { getVisitor } from "../api/getVisitor";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useGetVisitor(id: string, enabled = true) {
  return useQuery({
    queryKey: ["visitor", id],
    queryFn: ({ signal }) => getVisitor(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
