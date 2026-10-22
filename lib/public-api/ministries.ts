import type { PublicMinistry } from "@/lib/utils/public-groups";
import { publicApi } from "./client";

export async function getPublicMinistries(
  params?: {
    page?: number;
    limit?: number;
    search?: string;
  },
  options?: RequestInit,
) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 24),
  });
  if (params?.search) searchParams.set("search", params.search);

  return publicApi<PublicMinistry[]>(
    `/ministries?${searchParams.toString()}`,
    options,
  );
}

export async function getPublicMinistry(id: string, options?: RequestInit) {
  return getPublicMinistryBySlug(id, options);
}

export async function getPublicMinistryBySlug(
  slug: string,
  options?: RequestInit,
) {
  return publicApi<PublicMinistry>(
    `/ministries/${encodeURIComponent(slug)}`,
    options,
  );
}
