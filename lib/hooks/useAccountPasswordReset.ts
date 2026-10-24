import { useMutation } from "@tanstack/react-query";
import { requestAccountPasswordReset } from "@/lib/api/account-records";

export function useAccountPasswordReset() {
  return useMutation({ mutationFn: requestAccountPasswordReset, retry: false });
}
