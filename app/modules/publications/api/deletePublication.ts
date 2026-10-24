import { api } from "@/lib/api/client";

export async function deletePublication(
  id: string,
): Promise<{ data: Record<string, never> }> {
  const res = await api.delete(`/publications/${encodeURIComponent(id)}`, {
    timeout: 30000,
    silent: true,
  });
  if (res.data?.success !== true)
    throw new Error("Publication deletion could not be confirmed.");
  return res.data;
}
