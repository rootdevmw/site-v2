import { api } from "@/lib/api/client";

export async function getAttentionOverview() {
  const res = await api.get("/attention/manage");
  return res.data.data;
}
