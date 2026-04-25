import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { Role } from "../types/role.types";

export type RoleFilters = {
  page?: number;
  limit?: number;
};

export async function getRoles(
  params: RoleFilters,
): Promise<ApiResponse<Role>> {
  const res = await api.get("/roles", { params });
  return res.data;
}

export async function getRole(
  id: string,
): Promise<{ success: boolean; data: Role; meta: any }> {
  const res = await api.get(`/roles/${id}`);
  return res.data;
}

export async function createRole(data: {
  name: string;
}): Promise<{ success: boolean; data: Role; meta: any }> {
  const res = await api.post("/roles", data);
  return res.data;
}

export async function updateRole(
  id: string,
  data: { name: string },
): Promise<{ success: boolean; data: Role; meta: any }> {
  const res = await api.patch(`/roles/${id}`, data);
  return res.data;
}

export async function deleteRole(
  id: string,
): Promise<{ success: boolean; data: any; meta: any }> {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
}

// -----------------------------
// SET ROLE (single role system)
// -----------------------------
export async function setUserRole(params: {
  userId: string;
  roleId: string;
}): Promise<{ success: boolean; data: any; meta: any }> {
  const res = await api.post(
    `/auth/users/${params.userId}/role/${params.roleId}`,
  );

  return res.data;
}

// -----------------------------
// REMOVE ROLE
// -----------------------------
export async function removeUserRole(params: {
  userId: string;
}): Promise<{ success: boolean; data: any; meta: any }> {
  const res = await api.delete(`/auth/users/${params.userId}/role`);

  return res.data;
}
