"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProgramEditorTemplate,
  getProgramTemplateChoices,
  saveProgramEditor,
} from "@/lib/api/program-editor";
import { getTypeCatalog } from "@/lib/api/type-catalogs";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getAccountRoles } from "@/lib/utils/account-records";
import { retryRecordRequest } from "@/lib/utils/record-details";
import type {
  ProgramEditorKind,
  programEditorPayload,
} from "@/lib/utils/program-editor";
type Actor = { id: string; roles: string[] } | null;
export function useProgramEditorTypes(actor: Actor) {
  const roles = getAccountRoles(actor?.roles);
  return useQuery({
    queryKey: ["program-types", "editor", actor?.id, roles],
    queryFn: ({ signal }) => getTypeCatalog("programs", signal),
    enabled: !!actor?.id && hasRequiredRole(roles, ["DEACON"]),
    staleTime: 30000,
    retry: retryRecordRequest,
  });
}
export function useProgramTemplateChoices(
  filters: { page: number; search: string },
  actor: Actor,
) {
  const roles = getAccountRoles(actor?.roles);
  return useQuery({
    queryKey: [
      "program-templates",
      "editor-options",
      actor?.id,
      roles,
      filters,
    ],
    queryFn: ({ signal }) => getProgramTemplateChoices(filters, signal),
    enabled:
      !!actor?.id &&
      hasRequiredRole(roles, ["DEACON"]) &&
      filters.search.length <= 200,
    retry: retryRecordRequest,
  });
}
export function useProgramEditorTemplate(id: string, actor: Actor) {
  const roles = getAccountRoles(actor?.roles);
  return useQuery({
    queryKey: ["program-template", "editor-preview", actor?.id, roles, id],
    queryFn: ({ signal }) => getProgramEditorTemplate(id, signal),
    enabled: !!id && !!actor?.id && hasRequiredRole(roles, ["DEACON"]),
    retry: retryRecordRequest,
  });
}
export function useSaveProgramEditor(kind: ProgramEditorKind) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id?: string;
      data: ReturnType<typeof programEditorPayload>;
    }) => saveProgramEditor(kind, data, id),
    retry: false,
    onSettled: () =>
      Promise.all(
        [
          "programs",
          "program",
          "program-templates",
          "program-template",
          "homecells",
          "homecell",
          "members",
          "member",
          "audit-logs",
          "audit-timeline",
          "dashboard-overview",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      ),
  });
}
