import { useQuery } from "@tanstack/react-query";
import { getContent } from "../api/getContent";

export function useContent(id: string) {
  return useQuery({
    queryKey: ["content", id],
    queryFn: () => getContent(id),
  });
}
