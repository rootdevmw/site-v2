import { api } from "@/lib/api/client";

export async function markVisitor(id: string) {
  const res = await api.post(`/attention/visitors/${id}/ack`);
  return res.data;
}
