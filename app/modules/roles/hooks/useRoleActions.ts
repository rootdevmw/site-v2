import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getRole,
  createRole,
  updateRole,
  deleteRole,
  setUserRole,
  removeUserRole,
} from "../api/roles";
import { showError, showSuccess } from "@/lib/toast";

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

// -----------------------------
// SET ROLE
// -----------------------------
export function useSetRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setUserRole,

    onSuccess: (_, variables) => {
      showSuccess("Role updated");

      // Refresh user + users list
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: () => {
      showError("Failed to update role");
    },
  });
}

// -----------------------------
// REMOVE ROLE
// -----------------------------
export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUserRole,

    onSuccess: (_, variables) => {
      showSuccess("Role removed");

      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: () => {
      showError("Failed to remove role");
    },
  });
}
