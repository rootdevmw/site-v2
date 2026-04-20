import { api } from "@/lib/api/client";

export async function requestPasswordReset(email: string) {
  const res = await api.post("/auth/request-password-reset", { email });
  return res.data;
}
