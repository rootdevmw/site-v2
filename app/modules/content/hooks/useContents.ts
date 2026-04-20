import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getContents, ContentFilters } from "../api/getContents";
import { Content } from "../types/content.types";

export function useContents(filters: ContentFilters) {
  return usePaginatedQuery<Content>({
    queryKey: ["content"],
    queryFn: getContents,
    params: filters,
  });
}
