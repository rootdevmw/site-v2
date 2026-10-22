import type { PublicHomecell } from "@/lib/utils/public-groups";
import { publicApi } from "./client";

export async function getPublicHomecells(
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

  return publicApi<PublicHomecell[]>(
    `/homecells?${searchParams.toString()}`,
    options,
  );
}

export async function getPublicHomecell(id: string, options?: RequestInit) {
  return getPublicHomecellBySlug(id, options);
}

export async function getPublicHomecellBySlug(
  slug: string,
  options?: RequestInit,
) {
  return publicApi<PublicHomecell>(
    `/homecells/${encodeURIComponent(slug)}`,
    options,
  );
}
