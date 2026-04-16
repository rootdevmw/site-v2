import { useQuery } from "@tanstack/react-query";
import { getHomecellMembers } from "../api/getHomecellMembers";

export function useHomecellMembers(id: string) {
  return useQuery({
    queryKey: ["homecell-members", id],
    queryFn: () => getHomecellMembers(id),
    enabled: !!id,
  });
}
