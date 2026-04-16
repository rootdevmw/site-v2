import { api } from "@/lib/api/client";
import { useAuthStore } from "../store/auth.store";

export async function logout() {
  await api.post("/auth/logout");
  useAuthStore.getState().setUser(null);
  window.location.href = "/auth/login";
}
