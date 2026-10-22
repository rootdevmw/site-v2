import type { PublicMessage } from "@/lib/utils/public-messages";
import { publicApi } from "./client";

export async function getPublishedContent(
  params?: {
    page?: number;
    limit?: number;
    typeId?: string;
    search?: string;
    tags?: string;
  },
  options?: RequestInit,
) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
    tags: String(params?.tags ?? ""),
    search: String(params?.search ?? ""),
    status: "Published",
  });

  if (params?.typeId) {
    searchParams.set("typeId", params.typeId);
  }
  if (params?.tags) {
    searchParams.set("tags", params.tags);
  }

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  return publicApi<PublicMessage[]>(
    `/content?${searchParams.toString()}`,
    options,
  );
}

export async function getPublicContent(id: string, options?: RequestInit) {
  return getPublicContentBySlug(id, options);
}

export async function getPublicContentBySlug(
  slug: string,
  options?: RequestInit,
) {
  return publicApi<PublicMessage>(
    `/content/${encodeURIComponent(slug)}`,
    options,
  );
}

export async function getContentTypes(options?: RequestInit) {
  return publicApi<{ id: string; name: string }[]>(`/content/types`, options);
}
