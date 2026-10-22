import { api } from "@/lib/api/client";
import type { Content } from "../types/content.types";

export async function getContent(id: string, signal?: AbortSignal): Promise<{ data: Content }> {
  const res = await api.get(`/content/${id}`, { signal, timeout: 15000, silent: true });
  return res.data;
}
