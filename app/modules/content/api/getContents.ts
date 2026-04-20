import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { Content } from "../types/content.types";

export type ContentFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export async function getContents(
  params: ContentFilters,
): Promise<ApiResponse<Content>> {
  const res = await api.get("/content", { params });
  return res.data;
}
