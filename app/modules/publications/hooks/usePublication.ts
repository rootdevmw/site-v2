import { useQuery } from "@tanstack/react-query";
import { getPublication } from "../api/getPublication";
import { Publication } from "../types/publication.types";

export function usePublication(id: string) {
  return useQuery({
    queryKey: ["publication", id],
    queryFn: () => getPublication(id),
    enabled: !!id,
  });
}
