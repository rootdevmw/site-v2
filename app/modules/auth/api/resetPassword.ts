import { api } from "@/lib/api/client";

export async function resetPassword(token: string, password: string) {
  const res = await api.post("/auth/reset-password", { token, password });
  return res.data;
}
