import { api } from "@/lib/api/client";

export async function register(data: { email: string; password: string }) {
  const res = await api.post("/auth/register", data);
  return res.data;
}
