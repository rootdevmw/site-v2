"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEventEditorType, getEventEditorTypes, saveEventEditor } from "@/lib/api/event-editor";
import type { EventEditorPayload } from "@/lib/utils/event-editor";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getAccountRoles } from "@/lib/utils/account-records";
import { retryRecordRequest } from "@/lib/utils/record-details";
export function useEventEditorTypes(actor: { id: string; roles: string[] } | null) {
  const roles = getAccountRoles(actor?.roles);
  return useQuery({ queryKey: ["eventTypes", "editor", actor?.id, roles], queryFn: ({ signal }) => getEventEditorTypes(signal), enabled: !!actor?.id && hasRequiredRole(roles, ["DEACON"]), staleTime: 30000, retry: retryRecordRequest });
}
export function useCreateEventEditorType() {
  const client = useQueryClient();
  return useMutation({ mutationFn: createEventEditorType, retry: false, onSettled: () => Promise.all(["eventTypes", "audit-logs", "audit-timeline"].map((key) => client.invalidateQueries({ queryKey: [key] }))) });
}
export function useSaveEventEditor() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id?: string; data: EventEditorPayload }) => saveEventEditor(data, id), retry: false, onSettled: () => Promise.all(["events", "event", "ministries", "ministry", "audit-logs", "audit-timeline", "dashboard-overview"].map((key) => client.invalidateQueries({ queryKey: [key] }))) });
}
