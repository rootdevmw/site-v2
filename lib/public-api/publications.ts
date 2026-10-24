import type { PublicDocument } from "@/lib/utils/public-library";
import { publicApi } from "./client";

export async function getPublicPublications(
  params?: {
    page?: number;
    limit?: number;
    search?: string;
  },
  options?: RequestInit,
) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
  });

  if (params?.search) searchParams.set("search", params.search);
  return publicApi<PublicDocument[]>(
    `/publications?${searchParams.toString()}`,
    options,
  );
}
export function getPublicPublication(id: string, options?: RequestInit) {
  return publicApi<PublicDocument | null>(
    `/publications/${encodeURIComponent(id)}`,
    options,
  );
}
