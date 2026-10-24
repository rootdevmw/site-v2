import { api } from "@/lib/api/client";
import type { Content } from "../types/content.types";

export async function publishContent(id: string, status: "Published" | "Draft"): Promise<{ data: Pick<Content, "id" | "status"> }> {
  const res = await api.post(`/content/${id}/publish`, { status }, { timeout: 30000, silent: true });
  return res.data;
}
