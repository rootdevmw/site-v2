import { api } from "@/lib/api/client";
import { Stream, StreamFormValues } from "../types/stream.types";

export async function updateStream(
  id: string,
  data: StreamFormValues,
): Promise<{ data: Stream }> {
  const res = await api.put(`/streams/${id}`, data);
  return res.data;
}
