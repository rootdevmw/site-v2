import { api } from "@/lib/api/client";

export async function login(data: { email: string; password: string }) {
  const res = await api.post("/auth/login", data);
  return res.data;
}
