import { api } from "@/lib/api/client";
import type { Stream } from "../types/stream.types";
import { streamRecordId } from "@/lib/utils/stream-editor";

export async function setLiveStream(id: string): Promise<{ data: Stream }> {
  streamRecordId.parse(id);
  const res = await api.post(`/streams/${id}/live`, undefined, {
    timeout: 30000,
    silent: true,
  });
  if (res.data?.success === false || res.data?.data?.id !== id)
    throw new Error("Live selection could not be confirmed.");
  return res.data;
}

export async function endLiveStream(id: string): Promise<{ data: Stream }> {
  streamRecordId.parse(id);
  const res = await api.post(`/streams/${id}/end`, undefined, {
    timeout: 30000,
    silent: true,
  });
  if (
    res.data?.success === false ||
    res.data?.data?.id !== id ||
    res.data?.data?.isLive !== false
  )
    throw new Error("The end of the broadcast could not be confirmed.");
  return res.data;
}
