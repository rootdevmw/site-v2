import { api } from "@/lib/api/client";

export async function deleteStream(
  id: string,
): Promise<{ data: Record<string, never> }> {
  const res = await api.delete(`/streams/${encodeURIComponent(id)}`, {
    timeout: 30000,
    silent: true,
  });
  if (res.data?.success !== true)
    throw new Error("Stream deletion could not be confirmed.");
  return res.data;
}
