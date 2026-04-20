import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRole, createRole, updateRole, deleteRole } from "../api/roles";

export function useRole(id: string) {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => getRole(id),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      updateRole(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["role", variables.id] });
      }
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role"] });
    },
  });
}
