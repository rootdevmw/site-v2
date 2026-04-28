import type { Content } from "@/app/modules/content/types/content.types";
import { publicApi } from "./client";

export async function getPublishedContent(params?: {
  page?: number;
  limit?: number;
  typeId?: string;
  search?: string;
  tags?: string;
}) {
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

  return publicApi<Content[]>(`/content?${searchParams.toString()}`);
}

export async function getPublicContent(id: string) {
  return publicApi<Content>(`/content/${id}`);
}

export async function getPublicContentBySlug(slug: string) {
  return publicApi<Content>(`/content/${slug}`);
}

export async function getContentTypes() {
  return publicApi<{ id: string; name: string }[]>(`/content/types`);
}
