import { api } from "@/lib/api/client";

export async function getMe() {
  const res = await api.get("/auth/me");
  return res.data;
}
