import { accountWrite } from "@/lib/api/account-flows";

export function requestPasswordReset(email: string) {
  return accountWrite("request-password-reset", { email });
}
