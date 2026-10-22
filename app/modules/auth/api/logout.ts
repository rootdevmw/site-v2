import { accountWrite } from "@/lib/api/account-flows";

export function logout() {
  return accountWrite("logout", undefined);
}
