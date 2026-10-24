import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { Role } from "../types/role.types";

export type RoleFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getRoles(
  params: RoleFilters,
  signal?: AbortSignal,
): Promise<ApiResponse<Role>> {
  const res = await api.get("/roles", { params, signal, timeout: 15000, silent: true });
  return res.data;
}

export async function getRole(
  id: string,
  signal?: AbortSignal,
): Promise<{ success: boolean; data: Role; meta: unknown }> {
  const res = await api.get(`/roles/${id}`, { signal, timeout: 15000, silent: true });
  return res.data;
}

export async function createRole(data: {
  name: string;
}): Promise<{ success: boolean; data: Role; meta: unknown }> {
  const res = await api.post("/roles", data);
  return res.data;
}

export async function updateRole(
  id: string,
  data: { name: string },
): Promise<{ success: boolean; data: Role; meta: unknown }> {
  const res = await api.patch(`/roles/${id}`, data, { timeout: 30000 });
  return res.data;
}

export async function deleteRole(
  id: string,
): Promise<{ success: boolean; data: unknown; meta: unknown }> {
  const res = await api.delete(`/roles/${id}`, { timeout: 30000 });
  return res.data;
}

// -----------------------------
// SET ROLE (single role system)
// -----------------------------
export async function setUserRole(params: {
  userId: string;
  roleId: string;
}): Promise<{ success: boolean; data: unknown; meta: unknown }> {
  const res = await api.post(
    `/auth/users/${params.userId}/role/${params.roleId}`,
    undefined, { timeout: 30000, silent: true },
  );

  return res.data;
}

// -----------------------------
// REMOVE ROLE
// -----------------------------
export async function removeUserRole(params: {
  userId: string;
}): Promise<{ success: boolean; data: unknown; meta: unknown }> {
  const res = await api.delete(`/auth/users/${params.userId}/role`, { timeout: 30000, silent: true });

  return res.data;
}
