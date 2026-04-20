import { useQuery } from "@tanstack/react-query";
import { getNewsletter } from "../api/getNewsletter";
import { Newsletter } from "../types/newsletter.types";

export function useNewsletter(id: string) {
  return useQuery({
    queryKey: ["newsletter", id],
    queryFn: () => getNewsletter(id),
    enabled: !!id,
  });
}
