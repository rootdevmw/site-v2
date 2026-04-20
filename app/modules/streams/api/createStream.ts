import { api } from "@/lib/api/client";
import { Stream, StreamFormValues } from "../types/stream.types";

export async function createStream(
  data: StreamFormValues,
): Promise<{ data: Stream }> {
  const res = await api.post("/streams", data);
  return res.data;
}
