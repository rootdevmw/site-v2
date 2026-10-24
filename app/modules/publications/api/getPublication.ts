import { api } from "@/lib/api/client";
import type { Publication } from "../types/publication.types";

export async function getPublication(id: string, signal?: AbortSignal): Promise<{ data: Publication }> {
  const res = await api.get(`/publications/${id}`, { signal, timeout: 15000, silent: true });
  return res.data;
}
