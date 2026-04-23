import { useQuery } from "@tanstack/react-query";
import { getPrayer } from "../api/getPrayer";

export function useGetPrayer(id: string) {
  return useQuery({
    queryKey: ["prayer", id],
    queryFn: () => getPrayer(id),
  });
}
