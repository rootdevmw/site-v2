import { api } from "@/lib/api/client";
import type { Program } from "../types/program.types";

export async function getProgram(id: string, signal?: AbortSignal): Promise<{ data: Program }> {
  const res = await api.get(`/programs/${id}`, { signal, timeout: 15000, silent: true });
  return res.data;
}
