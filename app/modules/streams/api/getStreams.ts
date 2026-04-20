import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { Stream } from "../types/stream.types";

export type StreamFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getStreams(
  params: StreamFilters,
): Promise<ApiResponse<Stream>> {
  const res = await api.get("/streams", { params });
  return res.data;
}
