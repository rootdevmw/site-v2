"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStreamEditorPlatforms,
  saveStreamEditor,
  saveStreamPlatform,
} from "@/lib/api/stream-editor";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getAccountRoles } from "@/lib/utils/account-records";
import { retryRecordRequest } from "@/lib/utils/record-details";
import type {
  StreamEditorPayload,
  StreamPlatformValues,
} from "@/lib/utils/stream-editor";
export function useStreamEditorPlatforms(
  actor: { id: string; roles: string[] } | null,
) {
  const roles = getAccountRoles(actor?.roles);
  return useQuery({
    queryKey: ["platforms", "stream-editor", actor?.id, roles],
    queryFn: ({ signal }) => getStreamEditorPlatforms(signal),
    enabled: !!actor?.id && hasRequiredRole(roles, ["MEDIA"]),
    staleTime: 30000,
    refetchOnMount: "always",
    retry: retryRecordRequest,
  });
}
export function useSaveStreamEditor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: StreamEditorPayload }) =>
      saveStreamEditor(data, id),
    retry: false,
    onSettled: () =>
      Promise.all(
        [
          "streams",
          "stream",
          "live-stream",
          "audit-logs",
          "audit-timeline",
          "dashboard-overview",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      ),
  });
}
export function useSaveStreamPlatform() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: StreamPlatformValues }) =>
      saveStreamPlatform(data, id),
    retry: false,
    onSettled: () =>
      Promise.all(
        [
          "platforms",
          "platform",
          "streams",
          "stream",
          "live-stream",
          "audit-logs",
          "audit-timeline",
          "dashboard-overview",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      ),
  });
}
