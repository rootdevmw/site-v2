import { api } from "@/lib/api/client";

export async function getMe(silent = true) {
  const res = await api.get("/auth/me", { silent }).then((r) => r.data);
  return res;
}
