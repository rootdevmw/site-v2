import { useQuery } from "@tanstack/react-query";
import { getEvent } from "../api/getEvent";

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
  });
}
