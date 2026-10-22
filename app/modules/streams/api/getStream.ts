import { api } from "@/lib/api/client";
import type { Stream } from "../types/stream.types";

export async function getStream(id: string, signal?: AbortSignal): Promise<{ data: Stream }> {
  const res = await api.get(`/streams/${id}`, { signal, timeout: 15000, silent: true });
  return res.data;
}
