import { useQuery } from "@tanstack/react-query";
import { getVisitors } from "../api/getVisitors";

export function useVisitors() {
  return useQuery({
    queryKey: ["visitors"],
    queryFn: getVisitors,
  });
}
