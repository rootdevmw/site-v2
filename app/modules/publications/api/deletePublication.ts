import { api } from "@/lib/api/client";

export async function deletePublication(
  id: string,
): Promise<{ data: Record<string, never> }> {
  const res = await api.delete(`/publications/${id}`);
  return res.data;
}
