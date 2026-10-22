import { api } from "@/lib/api/client";
import type { Visitor } from "../types/attention.types";

export async function markVisitor(id: string) {
  const res = await api.post<{ success?: boolean; data: Visitor }>(`/attention/visitors/${encodeURIComponent(id)}/ack`, undefined, { timeout: 30000, silent: true });
  if (res.data.success === false || res.data.data?.id !== id || !["CONFIRMED", "COMPLETED"].includes(res.data.data.status)) throw new Error("Visitor status could not be confirmed.");
  return res.data;
}
