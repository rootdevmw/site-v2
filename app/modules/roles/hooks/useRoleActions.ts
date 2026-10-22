import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { retryRecordRequest } from "@/lib/utils/record-details";
import { refreshAccountRecord, refreshRoleDefinition, refreshSelfAccount } from "@/lib/utils/account-cache";
import {
  getRole,
  createRole,
  updateRole,
  deleteRole,
  setUserRole,
  removeUserRole,
} from "../api/roles";

export function useRole(id: string, enabled = true) {
  return useQuery({
    queryKey: ["role", id],
    queryFn: ({ signal }) => getRole(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
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
    retry: false,
    onSettled: (_data, _error, variables) => refreshRoleDefinition(queryClient, variables.id),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    retry: false,
    onSettled: (_data, _error, id) => refreshRoleDefinition(queryClient, id),
  });
}

// -----------------------------
// SET ROLE
// -----------------------------
export function useSetRole() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: setUserRole,
    retry: false,
    onMutate: ({ userId }) => client.cancelQueries({ queryKey: ["user", userId] }),
    onSettled: async (_data, _error, variables) => {
      await refreshSelfAccount(variables.userId);
      await refreshAccountRecord(client, variables.userId);
    },
  });
}

export function useRemoveRole() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: removeUserRole,
    retry: false,
    onMutate: ({ userId }) => client.cancelQueries({ queryKey: ["user", userId] }),
    onSettled: async (_data, _error, variables) => {
      await refreshSelfAccount(variables.userId);
      await refreshAccountRecord(client, variables.userId);
    },
  });
}
