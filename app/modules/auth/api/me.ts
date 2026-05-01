import { api } from "@/lib/api/client";

export async function getMe() {
  const res = await api.get("/auth/me", { silent: true }).then((r) => r.data);
  return res.data;
}
