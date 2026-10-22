import { api } from "@/lib/api/client";
import type { Visitor } from "../types/attention.types";

export async function getVisitor(id: string, signal?: AbortSignal) {
  const res = await api.get<{ data: Visitor | null }>(`/attention/visitors/${id}`, { signal, timeout: 15000, silent: true });
  return res.data.data;
}
