import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getMembers, MemberFilters } from "../api/getMembers";
import { Member } from "../types/member.types";

export function useMembers(filters: MemberFilters) {
  return usePaginatedQuery<Member>({
    queryKey: ["members"],
    queryFn: getMembers,
    params: filters,
  });
}
