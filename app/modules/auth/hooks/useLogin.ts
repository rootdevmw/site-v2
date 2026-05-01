import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api/login";
import { getMe } from "../api/me";
import { useAuthStore } from "../store/auth.store";

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading); // add this

  return useMutation({
    mutationFn: login,

    onSuccess: async () => {
      setLoading(true);
      try {
        const res = await getMe(false);
        if (res.success) {
          setUser(res.data);
        }
      } catch (err) {
        console.error("getMe error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }

      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
