import type { Publication } from "@/app/modules/publications/types/publication.types";
import { publicApi } from "./client";

export async function getPublicPublications(params?: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
  });

  return publicApi<Publication[]>(`/publications?${searchParams.toString()}`);
}
