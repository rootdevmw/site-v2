import { api } from "@/lib/api/client";

export async function markPrayer(id: string) {
  const res = await api.post(`/attention/prayers/${id}/prayed`);
  return res.data;
}
