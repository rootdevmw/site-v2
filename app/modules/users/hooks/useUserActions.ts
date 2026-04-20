import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUser,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
  linkUserToMember,
  unlinkUserFromMember,
} from "../api/users";

export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { email: string } }) =>
      updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      assignRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useLinkUserToMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, memberId }: { userId: string; memberId: string }) =>
      linkUserToMember(userId, memberId),

    onSuccess: (_data, variables) => {
      // refresh users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // refresh specific user
      if (variables?.userId) {
        queryClient.invalidateQueries({
          queryKey: ["user", variables.userId],
        });
      }

      // refresh members if you show linkage there
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useUnlinkUserFromMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      unlinkUserFromMember(userId),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });

      if (variables?.userId) {
        queryClient.invalidateQueries({
          queryKey: ["user", variables.userId],
        });
      }

      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
