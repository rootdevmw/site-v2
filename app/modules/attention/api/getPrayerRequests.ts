import { api } from "@/lib/api/client";

export async function getPrayerRequests() {
  const res = await api.get("/attention/prayer-requests");
  return res.data.data;
}
