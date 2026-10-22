import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetPassword } from "../api/resetPassword";
import { useAuthStore } from "../store/auth.store";
export function useResetPassword() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
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
