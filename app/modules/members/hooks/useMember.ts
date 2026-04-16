import { useQuery } from "@tanstack/react-query";
import { getMember } from "../api/getMember";

export function useMember(id: string) {
  return useQuery({
    queryKey: ["member", id],
    queryFn: () => getMember(id),
    enabled: !!id,
  });
}
