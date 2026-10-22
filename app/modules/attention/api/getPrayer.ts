import { api } from "@/lib/api/client";
import type { Prayer } from "../types/attention.types";

export async function getPrayer(id: string, signal?: AbortSignal) {
  const res = await api.get<{ data: Prayer | null }>(`/attention/prayers/${id}`, { signal, timeout: 15000, silent: true });
  return res.data.data;
}
