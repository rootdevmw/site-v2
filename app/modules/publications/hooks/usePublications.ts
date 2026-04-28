import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getPublications, PublicationFilters } from "../api/getPublications";
import { Publication } from "../types/publication.types";

export function usePublications(filters: PublicationFilters) {
  return usePaginatedQuery<Publication>({
    queryKey: ["publications"],
    queryFn: getPublications,
    params: filters,
  });
}
