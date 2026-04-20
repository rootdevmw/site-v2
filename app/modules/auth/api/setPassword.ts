import { api } from "@/lib/api/client";

export async function setPassword(token: string, password: string) {
  const res = await api.post("/auth/set-password", { token, password });
  return res.data;
}
