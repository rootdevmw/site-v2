import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { Member } from "../types/member.types";

export type MemberFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export async function getMembers(
  params: MemberFilters,
): Promise<ApiResponse<Member>> {
  const res = await api.get("/members", { params });
  return res.data;
}
