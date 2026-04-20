import { useMutation } from "@tanstack/react-query";
import { setPassword } from "../api/setPassword";

export function useSetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      setPassword(token, password),
  });
}
