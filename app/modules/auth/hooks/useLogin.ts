import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api/login";
import { getMe } from "../api/me";
import { useAuthStore } from "../store/auth.store";

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: login,

    onSuccess: async () => {
      // Immediately fetch user
      try {
        const res = await getMe();

        if (res.success) {
          setUser(res.data);
        }
      } catch {
        setUser(null);
      }

      // keep React Query in sync
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
