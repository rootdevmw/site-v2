import { api } from "@/lib/api/client";

export async function getMinistry(id: string) {
  const res = await api.get(`/ministries/${id}`);
  return res.data;
}
