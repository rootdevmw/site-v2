import { useQuery } from "@tanstack/react-query";
import { getProgramTemplate } from "../api/getProgramTemplate";

export function useProgramTemplate(id: string) {
  return useQuery({
    queryKey: ["program-template", id],
    queryFn: () => getProgramTemplate(id),
    enabled: !!id, //
  });
}
