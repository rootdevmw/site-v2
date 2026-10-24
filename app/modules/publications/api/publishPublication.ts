import { api } from "@/lib/api/client";
import type { Publication } from "../types/publication.types";

export async function publishPublication(id: string): Promise<{ data: Publication }> {
  const res = await api.patch(`/publications/${id}/publish`, undefined, { timeout: 30000, silent: true });
  return res.data;
}

export async function unpublishPublication(id: string): Promise<{ data: Publication }> {
  const res = await api.patch(`/publications/${id}/unpublish`, undefined, { timeout: 30000, silent: true });
  return res.data;
}
