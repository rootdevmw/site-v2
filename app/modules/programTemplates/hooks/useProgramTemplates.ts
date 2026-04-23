import { useQuery } from "@tanstack/react-query";
import { getProgramTemplates } from "../api/getProgramTemplates";

export function useProgramTemplates(params?: {
  homecellId?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["program-templates", params],
    queryFn: () => getProgramTemplates(params),
  });
}
