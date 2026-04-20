import { api } from "@/lib/api/client";

export async function deleteStream(id: string): Promise<{ data: {} }> {
  const res = await api.delete(`/streams/${id}`);
  return res.data;
}
