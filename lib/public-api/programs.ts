import type { PublicProgram } from "@/lib/utils/public-programs";
import { publicApi } from "./client";

export async function getPublicPrograms(
  params?: {
    page?: number;
    limit?: number;
    date?: string;
    fromDate?: string;
    homecellId?: string;
    typeId?: string;
    period?: "upcoming" | "past";
    search?: string;
  },
  options?: RequestInit,
) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 24),
  });

  if (params?.date) searchParams.append("date", params.date);
  if (params?.fromDate) searchParams.append("fromDate", params.fromDate);
  if (params?.homecellId) searchParams.append("homecellId", params.homecellId);
  if (params?.typeId) searchParams.append("typeId", params.typeId);
  if (params?.period) searchParams.set("period", params.period);
  if (params?.search) searchParams.set("search", params.search);
  return publicApi<PublicProgram[]>(
    `/programs?${searchParams.toString()}`,
    options,
  );
}

export async function getPublicProgram(id: string, options?: RequestInit) {
  return getPublicProgramBySlug(id, options);
}

export async function getPublicProgramBySlug(
  slug: string,
  options?: RequestInit,
) {
  return publicApi<PublicProgram>(
    `/programs/${encodeURIComponent(slug)}`,
    options,
  );
}

export async function getProgramTypes(options?: RequestInit) {
  return publicApi<{ id: string; name: string }[]>(`/programs/types`, options);
}
