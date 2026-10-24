import { accountWrite } from "@/lib/api/account-flows";

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  return accountWrite("change-password", data);
}
