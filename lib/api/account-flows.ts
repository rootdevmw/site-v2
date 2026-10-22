import { z } from "zod";
import { api } from "@/lib/api/client";
export const accountUserSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/),
  email: z.string(),
  roles: z.array(z.string()),
});
const confirmation = z.object({ success: z.literal(true), data: z.unknown() });
export async function accountWrite(
  path:
    | "login"
    | "request-password-reset"
    | "set-password"
    | "reset-password"
    | "change-password"
    | "logout",
  data?: unknown,
) {
  const response = await api.post("/auth/" + path, data, {
    timeout: 30000,
    silent: true,
  });
  return confirmation.parse(response.data);
}
export async function accountSignIn(data: { email: string; password: string }) {
  const result = await accountWrite("login", data);
  return { success: true as const, data: accountUserSchema.parse(result.data) };
}
