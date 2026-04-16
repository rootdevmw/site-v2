// modules/homecells/hooks/useHomecells.ts
import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getHomecells } from "../api/getHomecells";
import { Homecell } from "../types/homecell.types";

export function useHomecells(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return usePaginatedQuery<Homecell>({
    queryKey: ["homecells", params],
    queryFn: getHomecells,
    params,
  });
}
