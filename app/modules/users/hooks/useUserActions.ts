import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { retryRecordRequest } from "@/lib/utils/record-details";
import { refreshAccountRecord } from "@/lib/utils/account-cache";
import {
  getUser,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
  linkUserToMember,
  unlinkUserFromMember,
} from "../api/users";

export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: ({ signal }) => getUser(id, signal),
    enabled: !!id && enabled,
    retry: retryRecordRequest,
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
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, memberId }: { userId: string; memberId: string; previousMemberId?: string }) => linkUserToMember(userId, memberId),
    retry: false,
    onMutate: ({ userId }) => client.cancelQueries({ queryKey: ["user", userId] }),
    onSettled: (_data, _error, variables) => refreshAccountRecord(client, variables.userId, [variables.memberId, variables.previousMemberId]),
  });
}

export function useUnlinkUserFromMember() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string; memberId?: string }) => unlinkUserFromMember(userId),
    retry: false,
    onMutate: ({ userId }) => client.cancelQueries({ queryKey: ["user", userId] }),
    onSettled: (_data, _error, variables) => refreshAccountRecord(client, variables.userId, [variables.memberId]),
  });
}
