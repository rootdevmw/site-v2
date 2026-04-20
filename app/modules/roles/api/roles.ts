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
