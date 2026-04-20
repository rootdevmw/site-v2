import type { Ministry } from "@/app/modules/ministries/types/ministry.types";
import { publicApi } from "./client";

export async function getPublicMinistries(params?: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 24),
  });

  return publicApi<Ministry[]>(`/ministries?${searchParams.toString()}`);
}

export async function getPublicMinistry(id: string) {
  return publicApi<Ministry>(`/ministries/${id}`);
}
