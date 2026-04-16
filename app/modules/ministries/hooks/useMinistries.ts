import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getMinistries } from "../api/getMinistries";
import { MinistryFilters } from "../types/ministry.types";

export function useMinistries(filters: MinistryFilters) {
  return usePaginatedQuery({
    queryKey: ["ministries"],
    queryFn: getMinistries,
    params: filters,
  });
}
