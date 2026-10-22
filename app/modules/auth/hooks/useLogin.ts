import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api/login";
import { useAuthStore } from "../store/auth.store";
export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: login,
    retry: false,
    gcTime: 0,
    onSuccess: async (result) => {
      await client.cancelQueries();
      client.removeQueries();
      const state = useAuthStore.getState();
      state.setNotice(null);
      state.setUser(result.data);
      state.setLoading(false);
      state.setInitialized(true);
    },
  });
}
