import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useLogout() {
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
  });
}
