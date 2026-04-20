import { api } from "@/lib/api/client";

export async function deleteContent(id: string) {
  const res = await api.delete(`/content/${id}`);
  return res.data;
}
