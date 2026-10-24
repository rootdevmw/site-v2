import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setPassword } from "../api/setPassword";
import { useAuthStore } from "../store/auth.store";
export function useSetPassword() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      setPassword(token, password),
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
