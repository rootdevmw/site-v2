import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { Newsletter } from "../types/newsletter.types";

export type NewsletterFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getNewsletters(
  params: NewsletterFilters,
): Promise<ApiResponse<Newsletter>> {
  const res = await api.get("/newsletters", { params });
  return res.data;
}
