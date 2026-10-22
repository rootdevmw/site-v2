import { api } from "@/lib/api/client";
import type { Prayer } from "../types/attention.types";

export async function markPrayer(id: string) {
  const res = await api.post<{ success?: boolean; data: Prayer }>(`/attention/prayers/${encodeURIComponent(id)}/prayed`, undefined, { timeout: 30000, silent: true });
  if (res.data.success === false || res.data.data?.id !== id || res.data.data.status !== "PRAYED_FOR") throw new Error("Prayer status could not be confirmed.");
  return res.data;
}
