import { api } from "@/lib/api/client";

export async function getPrayer(id: string) {
  const res = await api.get("/attention/prayer-requests");
  return res.data.data.find((p: any) => p.id === id);
}
