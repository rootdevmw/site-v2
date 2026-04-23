import { useQuery } from "@tanstack/react-query";
import { getPrayerRequests } from "../api/getPrayerRequests";

export function usePrayerRequests() {
  return useQuery({
    queryKey: ["prayers"],
    queryFn: getPrayerRequests,
  });
}
