import { api } from "@/lib/api/client";

export async function getMember(id: string) {
  const res = await api.get(`/members/${id}`);
  return res.data;
}
