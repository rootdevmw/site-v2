import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../api/requestPasswordReset";

export function useRequestPasswordReset() {
  return useMutation({
    retry: false,
    gcTime: 0,
    mutationFn: ({ email }: { email: string }) => requestPasswordReset(email),
  });
}
