import { useQuery } from "@tanstack/react-query";
import { getMinistry } from "../api/getMinistry";

export function useMinistry(id: string) {
  return useQuery({
    queryKey: ["ministry", id],
    queryFn: () => getMinistry(id),
    enabled: !!id,
  });
}
