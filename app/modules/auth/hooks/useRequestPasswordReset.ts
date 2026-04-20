import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../api/requestPasswordReset";

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => requestPasswordReset(email),
  });
}
