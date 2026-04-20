import { api } from "@/lib/api/client";

export async function deleteNewsletter(
  id: string,
): Promise<{ data: Record<string, never> }> {
  const res = await api.delete(`/newsletters/${id}`);
  return res.data;
}
