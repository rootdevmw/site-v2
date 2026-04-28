import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { Publication } from "../types/publication.types";

export type PublicationFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getPublications(
  params: PublicationFilters,
): Promise<ApiResponse<Publication>> {
  const res = await api.get("/publications", { params });
  return res.data;
}
