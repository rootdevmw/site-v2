import { accountWrite } from "@/lib/api/account-flows";

export function setPassword(token: string, password: string) {
  return accountWrite("set-password", { token, password });
}
