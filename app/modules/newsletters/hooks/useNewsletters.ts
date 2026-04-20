import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getNewsletters, NewsletterFilters } from "../api/getNewsletters";
import { Newsletter } from "../types/newsletter.types";

export function useNewsletters(filters: NewsletterFilters) {
  return usePaginatedQuery<Newsletter>({
    queryKey: ["newsletters"],
    queryFn: getNewsletters,
    params: filters,
  });
}
