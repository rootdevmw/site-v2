import { logout } from "../api/logout";
import { useAuthStore } from "../store/auth.store";

export async function handleLogout() {
  await logout();
  useAuthStore.getState().setUser(null);
  window.location.href = "/login";
}
