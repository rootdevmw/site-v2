import { useQuery } from "@tanstack/react-query";
import { getHomecell } from "../api/getHomecell";

export function useHomecell(id: string) {
  return useQuery({
    queryKey: ["homecell", id],
    queryFn: () => getHomecell(id),
    enabled: !!id,
  });
}
