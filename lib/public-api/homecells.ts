import type { Homecell } from "@/app/modules/homecells/types/homecell.types";
import { publicApi } from "./client";

export async function getPublicHomecells(params?: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 24),
  });

  return publicApi<Homecell[]>(`/homecells?${searchParams.toString()}`);
}

export async function getPublicHomecell(id: string) {
  return publicApi<Homecell>(`/homecells/${id}`);
}
