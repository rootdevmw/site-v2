import { useQuery } from "@tanstack/react-query";
import { getProgramTemplate } from "../api/getProgramTemplate";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useProgramTemplate(id: string, enabled = true) {
  return useQuery({
    queryKey: ["program-template", id],
    queryFn: ({ signal }) => getProgramTemplate(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
  });
}
