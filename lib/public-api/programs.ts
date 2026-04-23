import type { Program } from "@/app/modules/programs/types/program.types";
import { publicApi } from "./client";

export async function getPublicPrograms(params?: {
  page?: number;
  limit?: number;
  date?: string;
  fromDate?: string;
  homecellId?: string;
  typeId?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 24),
  });

  if (params?.date) searchParams.append("date", params.date);
  if (params?.fromDate) searchParams.append("fromDate", params.fromDate);
  if (params?.homecellId) searchParams.append("homecellId", params.homecellId);
  if (params?.typeId) searchParams.append("typeId", params.typeId);
  return publicApi<Program[]>(`/programs?${searchParams.toString()}`);
}

export async function getPublicProgram(id: string) {
  return publicApi<Program>(`/programs/${id}`);
}

export async function getProgramTypes() {
  return publicApi<{ id: string; name: string }[]>(`/programs/types`);
}
