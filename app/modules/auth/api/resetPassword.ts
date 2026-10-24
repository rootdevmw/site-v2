import { accountWrite } from "@/lib/api/account-flows";

export function resetPassword(token: string, password: string) {
  return accountWrite("reset-password", { token, password });
}
