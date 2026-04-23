import { api } from "@/lib/api/client";

export async function getVisitors() {
  const res = await api.get("/attention/visitors");
  return res.data.data;
}
