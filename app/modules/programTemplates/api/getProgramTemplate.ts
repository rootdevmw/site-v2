import { api } from "@/lib/api/client";
import type { ProgramTemplate } from "../types/programTemplate.types";

export async function getProgramTemplate(id: string, signal?: AbortSignal): Promise<{ data: ProgramTemplate }> {
  const res = await api.get(`/program-templates/${id}`, { signal, timeout: 15000, silent: true });
  return res.data;
}
