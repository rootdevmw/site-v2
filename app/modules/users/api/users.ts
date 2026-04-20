import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { User } from "../types/user.types";

export type UserFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getUsers(
  params: UserFilters,
): Promise<ApiResponse<User>> {
  const res = await api.get("/users", { params });
  console.log("getUsers response:", res.data);
  return res.data;
}

export async function getUser(
  id: string,
): Promise<{ success: boolean; data: User; meta: any }> {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateUser(
  id: string,
  data: { email: string },
): Promise<{ success: boolean; data: User; meta: any }> {
  const res = await api.patch(`/users/${id}`, data);
  return res.data;
}

export async function createUser(data: {
  email: string;
  password: string;
}): Promise<{ success: boolean; data: User; meta: any }> {
  const res = await api.post("/users", data);
  return res.data;
}

export async function deleteUser(
  id: string,
): Promise<{ success: boolean; data: any; meta: any }> {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function assignRole(
  userId: string,
  roleId: string,
): Promise<{ success: boolean; data: any; meta: any }> {
  const res = await api.post(`/auth/assign-role/${userId}/${roleId}`);
  return res.data;
}

// -----------------------------
// LINK USER → MEMBER
// -----------------------------
export async function linkUserToMember(
  userId: string,
  memberId: string,
): Promise<{ success: boolean; data: any; meta: any }> {
  const res = await api.post(`/users/${userId}/member`, {
    memberId,
  });

  return res.data;
}

// -----------------------------
// UNLINK USER → MEMBER
// -----------------------------
export async function unlinkUserFromMember(
  userId: string,
): Promise<{ success: boolean; data: any; meta: any }> {
  const res = await api.delete(`/users/${userId}/member`);

  return res.data;
}
