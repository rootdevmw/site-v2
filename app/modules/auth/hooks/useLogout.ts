import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../api/logout";
import { useAuthStore } from "../store/auth.store";
export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    retry: false,
    gcTime: 0,
    onSuccess: async () => {
      await client.cancelQueries();
      client.removeQueries();
      const state = useAuthStore.getState();
      state.setUser(null);
      state.setLoading(false);
      state.setInitialized(true);
    },
  });
}
