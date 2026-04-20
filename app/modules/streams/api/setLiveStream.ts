import { api } from "@/lib/api/client";
import { Stream } from "../types/stream.types";

export async function setLiveStream(id: string): Promise<{ data: Stream }> {
  const res = await api.post(`/streams/${id}/live`);
  return res.data;
}
