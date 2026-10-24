import { api } from "@/lib/api/client";
import { accountUserSchema } from "@/lib/api/account-flows";

export async function getMe(silent = true, signal?: AbortSignal) {
  const response = await api.get("/auth/me", {
    silent,
    signal,
    timeout: 15000,
  });
  if (response.data?.success !== true)
    throw new Error("Session could not be confirmed.");
  return {
    success: true as const,
    data: accountUserSchema.parse(response.data.data),
  };
}
