import { api } from "@/lib/api/client";
import { useMutation } from "@tanstack/react-query";

export function useSetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      api.post("/auth/set-password", data),
  });
}
