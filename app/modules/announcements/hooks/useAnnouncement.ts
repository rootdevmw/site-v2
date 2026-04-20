import { useQuery } from "@tanstack/react-query";
import { getAnnouncement } from "../api/getAnnouncement";

export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: ["announcement", id],
    queryFn: () => getAnnouncement(id),
  });
}
