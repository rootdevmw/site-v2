import { api } from "@/lib/api/client";
import { Content } from "../types/content.types";

export async function getContent(id: string) {
  const res = await api.get(`/content/${id}`);
  return res.data as { data: Content };
}
