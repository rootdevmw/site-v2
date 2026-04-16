import { useQuery } from "@tanstack/react-query";
import { getProgram } from "../api/getProgram";

export function useProgram(id: string) {
  return useQuery({
    queryKey: ["program", id],
    queryFn: () => getProgram(id),
    enabled: !!id,
  });
}
