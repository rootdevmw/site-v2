import { api } from "@/lib/api/client";
import { getRoles } from "@/app/modules/roles/api/roles";
import type { Role } from "@/app/modules/roles/types/role.types";

export type AccountMemberCandidate = { id: string; firstName: string; lastName: string; userId?: string | null; deletedAt?: string | null };

export async function getAccountMemberPage(params: { page: number; search: string }, signal?: AbortSignal) {
  const response = await api.get<{ data: AccountMemberCandidate[]; meta?: { total?: number; limit?: number } }>("/members", { params: { ...params, limit: 20 }, signal, timeout: 15000, silent: true });
  return response.data;
}

export async function getAccountRoleCatalog(signal?: AbortSignal) {
  const roles = new Map<string, Role>();
  let page = 1;
  let pages = 1;
  let total = 0;
  do {
    signal?.throwIfAborted();
    const response = await getRoles({ page, limit: 100 }, signal);
    signal?.throwIfAborted();
    const limit = response.meta?.limit ?? 100;
    if (!Number.isInteger(limit) || limit < 1) throw new Error("The role catalog returned invalid pagination.");
    total = response.meta?.total ?? response.data.length;
    pages = Math.max(1, Math.ceil(total / limit));
    if (!Number.isFinite(pages)) throw new Error("The role catalog returned invalid pagination.");
    const previousSize = roles.size;
    response.data.forEach((role) => roles.set(role.id, role));
    if ((page > 1 && roles.size === previousSize) || (!response.data.length && total)) throw new Error("The complete role catalog could not be loaded.");
    page++;
  } while (page <= pages);
  if (roles.size < total) throw new Error("The complete role catalog could not be loaded.");
  return [...roles.values()];
}

export async function requestAccountPasswordReset(email: string) {
  const response = await api.post("/auth/request-password-reset", { email }, { timeout: 30000, silent: true });
  return response.data;
}

export async function getSessionIdentity() {
  const response = await api.get<{ data: { id: string; email: string; roles: string[] } }>("/auth/me", { timeout: 15000, silent: true });
  const user = response.data.data;
  if (!user?.id || !user.email || !Array.isArray(user.roles)) throw new Error("The current account could not be confirmed.");
  return { id: user.id, email: user.email, roles: user.roles };
}
