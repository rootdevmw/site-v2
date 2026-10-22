"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getContentAuthorOptions,
  saveContentEditor,
} from "@/lib/api/content-editor";
import { getTypeCatalog } from "@/lib/api/type-catalogs";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getAccountRoles } from "@/lib/utils/account-records";
import { retryRecordRequest } from "@/lib/utils/record-details";
import type { contentEditorPayload } from "@/lib/utils/content-editor";
type Actor = { id: string; roles: string[] } | null;
export function useContentEditorTypes(actor: Actor) {
  const roles = getAccountRoles(actor?.roles);
  return useQuery({
    queryKey: ["content-types", "editor", actor?.id, roles],
    queryFn: ({ signal }) => getTypeCatalog("content", signal),
    enabled: !!actor?.id && hasRequiredRole(roles, ["MEDIA"]),
    staleTime: 30000,
    retry: retryRecordRequest,
  });
}
export function useContentAuthors(
  filters: { page: number; search: string },
  actor: Actor,
) {
  const roles = getAccountRoles(actor?.roles);
  return useQuery({
    queryKey: ["content", "author-options", actor?.id, roles, filters],
    queryFn: ({ signal }) => getContentAuthorOptions(filters, signal),
    enabled:
      !!actor?.id &&
      hasRequiredRole(roles, ["MEDIA"]) &&
      filters.search.length <= 200,
    staleTime: 30000,
    refetchOnMount: "always",
    retry: retryRecordRequest,
  });
}
export function useSaveContentEditor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id?: string;
      data: ReturnType<typeof contentEditorPayload>;
    }) => saveContentEditor(data, id),
    retry: false,
    onSettled: () =>
      Promise.all(
        [
          "content",
          "content-types",
          "audit-logs",
          "audit-timeline",
          "dashboard-overview",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      ),
  });
}
