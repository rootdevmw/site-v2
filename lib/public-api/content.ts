import type { Content } from "@/app/modules/content/types/content.types";
import { publicApi } from "./client";

export async function getPublishedContent(params?: {
  page?: number;
  limit?: number;
  typeId?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
    status: "Published",
  });

  if (params?.typeId) {
    searchParams.set("typeId", params.typeId);
  }

  return publicApi<Content[]>(`/content?${searchParams.toString()}`);
}

export async function getPublicContent(id: string) {
  return publicApi<Content>(`/content/${id}`);
}

export async function getContentTypes() {
  return publicApi<{ id: string; name: string }[]>(`/content/types`);
}
