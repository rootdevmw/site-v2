import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getAllUsers, getUsers, UserFilters } from "../api/users";
import { User } from "../types/user.types";

export function useUsers(filters: UserFilters) {
  return usePaginatedQuery<User>({
    queryKey: ["users"],
    queryFn: getUsers,
    params: filters,
  });
}

export function useAllUsers(filters: UserFilters) {
  return usePaginatedQuery<User>({
    queryKey: ["users"],
    queryFn: getAllUsers,
    params: filters,
  });
}
