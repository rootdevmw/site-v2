import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changePassword } from "../api/changePassword";
import { useAuthStore } from "../store/auth.store";
import { accountFailureStatus } from "@/lib/utils/account-flows";
export function useChangePassword() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: changePassword,
    retry: false,
    gcTime: 0,
    onError: async (error) => {
      const status = accountFailureStatus(error);
      if (
        status === null ||
        (typeof status === "number" && status >= 500) ||
        status === 401
      ) {
        await client.cancelQueries();
        client.removeQueries();
        const state = useAuthStore.getState();
        state.setNotice(status === 401 ? null : "password-uncertain");
        state.setUser(null);
        state.setLoading(false);
        state.setInitialized(true);
      }
    },
    onSuccess: async () => {
      await client.cancelQueries();
      client.removeQueries();
      const state = useAuthStore.getState();
      state.setNotice("password-changed");
      state.setUser(null);
      state.setLoading(false);
      state.setInitialized(true);
    },
  });
}
