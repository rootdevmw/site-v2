import type { User } from "@/app/modules/users/types/user.types";
import type { Role } from "@/app/modules/roles/types/role.types";
import type { AuditEntry } from "@/app/modules/audit/types/audit.types";
import { getAuditEntity } from "@/config/audit-entities";
import { ROLE_HIERARCHY } from "@/lib/auth/roles";

export type AccessKind = "users" | "roles";
export type AccessFilters = { page: number; search: string; role: string; linked: string };
export type AuditFilters = { page: number; search: string; action: string; actorId: string; from: string; to: string };
export type ManagementPage<T> = { data: T[]; total: number; limit: number };
export type AccessEntry = { id: string; name: string; createdAt?: string; roles?: string[]; member?: User["member"] };
export const accessInfo = {
  users: { title: "Users", singular: "user", requiredRole: "ADMIN", description: "Connect website accounts with the people in your church and review their recorded roles." },
  roles: { title: "Roles", singular: "role", requiredRole: "ROOT", description: "Review role definitions and their place in the configured dashboard hierarchy." },
} as const;

function pageNumber(params: Pick<URLSearchParams, "get">) {
  const page = Number(params.get("page"));
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
export function readAccessFilters(kind: AccessKind, params: Pick<URLSearchParams, "get">): AccessFilters {
  const role = params.get("role")?.toUpperCase() ?? "";
  return {
    page: pageNumber(params), search: params.get("search")?.trim() ?? "",
    role: kind === "users" && ROLE_HIERARCHY.some((item) => item === role) ? role : "",
    linked: kind === "users" && ["true", "false"].includes(params.get("linked") ?? "") ? params.get("linked")! : "",
  };
}
export function accessParams(kind: AccessKind, filters: AccessFilters, paged = true) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (kind === "users") for (const key of ["role", "linked"] as const) if (filters[key]) params.set(key, filters[key]);
  if (paged && filters.page > 1) params.set("page", String(filters.page));
  return params;
}
export function accessHref(kind: AccessKind, filters: AccessFilters) {
  const query = accessParams(kind, filters).toString();
  return "/dashboard/" + kind + (query ? "?" + query : "");
}
export function accessEntry(kind: AccessKind, record: User | Role): AccessEntry {
  if (kind === "roles") return { id: record.id, name: (record as Role).name };
  const user = record as User;
  return { id: user.id, name: user.email, roles: user.roles, createdAt: user.createdAt, member: user.member ? { id: user.member.id, firstName: user.member.firstName, lastName: user.member.lastName } : null };
}

export function readAuditFilters(params: Pick<URLSearchParams, "get">): AuditFilters {
  return { page: pageNumber(params), search: params.get("search")?.trim() ?? "", action: params.get("action")?.trim() ?? "", actorId: params.get("actorId")?.trim() ?? "", from: params.get("from") ?? "", to: params.get("to") ?? "" };
}
export function auditParams(filters: AuditFilters, paged = true) {
  const params = new URLSearchParams();
  for (const key of ["search", "action", "actorId", "from", "to"] as const) if (filters[key]) params.set(key, filters[key]);
  if (paged && filters.page > 1) params.set("page", String(filters.page));
  return params;
}
export function auditHref(entity: string, filters: AuditFilters) {
  const query = auditParams(filters).toString();
  return "/dashboard/audit/" + encodeURIComponent(getAuditEntity(entity).key) + (query ? "?" + query : "");
}
export function auditFilterError(filters: AuditFilters) {
  if (filters.actorId && !/^[1-9]\d*$/.test(filters.actorId)) return "Enter a valid actor account ID.";
  for (const value of [filters.from, filters.to].filter(Boolean)) {
    const date = new Date(value + "T00:00:00Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return "Choose valid calendar dates.";
  }
  return filters.from && filters.to && filters.from > filters.to ? "The end date must follow the start date." : "";
}
export function auditTimelineHref(entry: AuditEntry) {
  return entry.entityId && getAuditEntity(entry.entity).key !== "SESSION" ? "/dashboard/audit/" + encodeURIComponent(getAuditEntity(entry.entity).key) + "/" + encodeURIComponent(entry.entityId) : null;
}

export function validateManagementPage<T>(response: { success?: boolean; data: T[]; meta?: { total?: number; limit?: number; page?: number } }, page: number): ManagementPage<T> {
  const { data, meta, success } = response;
  const total = meta?.total;
  const limit = meta?.limit;
  if (success === false || !Array.isArray(data) || typeof total !== "number" || !Number.isSafeInteger(total) || total < 0 || typeof limit !== "number" || !Number.isSafeInteger(limit) || limit < 1 || (meta?.page !== undefined && meta.page !== page)) throw new Error("The list returned an incomplete page.");
  if ((!data.length && total > (page - 1) * limit) || data.length > limit || data.length > total) throw new Error("The list returned an inconsistent page.");
  return { data, total, limit };
}
