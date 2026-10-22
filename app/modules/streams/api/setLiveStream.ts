import { api } from "@/lib/api/client";
import type { Stream } from "../types/stream.types";

export async function setLiveStream(id: string): Promise<{ data: Stream }> {
  const res = await api.post(`/streams/${id}/live`, undefined, {
    timeout: 30000,
    silent: true,
  });
  if (res.data?.success === false || res.data?.data?.id !== id)
    throw new Error("Live selection could not be confirmed.");
  return res.data;
}
