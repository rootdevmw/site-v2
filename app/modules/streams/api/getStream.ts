import { api } from "@/lib/api/client";
import { Stream } from "../types/stream.types";

export async function getStream(id: string): Promise<{ data: Stream }> {
  const res = await api.get(`/streams/${id}`);
  return res.data;
}
