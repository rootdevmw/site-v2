import { api } from "@/lib/api/client";
import { getUsers } from "@/app/modules/users/api/users";
import { getRoles } from "@/app/modules/roles/api/roles";
import type { User } from "@/app/modules/users/types/user.types";
import type { Role } from "@/app/modules/roles/types/role.types";
import { getAuditLogs } from "@/app/modules/audit/api/audit.api";
import { DIRECTORY_LIMIT } from "@/lib/utils/directory-records";
import { accessEntry, accessParams, validateManagementPage, type AccessFilters, type AccessKind, type AuditFilters } from "@/lib/utils/access-lists";

export async function getAccessList(kind: AccessKind, filters: AccessFilters, signal?: AbortSignal) {
  const params = { ...Object.fromEntries(accessParams(kind, filters, false)), page: filters.page, limit: DIRECTORY_LIMIT };
  const response = kind === "users" ? await getUsers(params, signal) : await getRoles(params, signal);
  const page = validateManagementPage<User | Role>(response, filters.page);
  return { ...page, data: page.data.map((record) => accessEntry(kind, record)) };
}
export async function getAuditList(entity: string, filters: AuditFilters, signal?: AbortSignal) {
  const { action, ...params } = filters;
  return validateManagementPage(await getAuditLogs({ entity, ...params, actionSearch: action, limit: DIRECTORY_LIMIT }, signal), filters.page);
}
export async function deleteAccessRecord(kind: AccessKind, id: string) {
  const response = await api.delete<{ success?: boolean }>("/" + kind + "/" + encodeURIComponent(id), { timeout: 30000, silent: true });
  if (response.data.success === false) throw new Error("Deletion could not be confirmed.");
  return response.data;
}
