import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getRoles, RoleFilters } from "../api/roles";
import { Role } from "../types/role.types";

export function useRoles(filters: RoleFilters) {
  return usePaginatedQuery<Role>({
    queryKey: ["roles"],
    queryFn: getRoles,
    params: filters,
  });
}
