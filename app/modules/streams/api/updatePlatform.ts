import { api } from "@/lib/api/client";
import { Stream } from "../types/stream.types";
import { PlatformFormValues } from "../validation/platform.schema";

export async function updatePlatform(
  id: string,
  data: PlatformFormValues,
): Promise<{ data: Stream }> {
  const res = await api.patch(`/streams/platforms/${id}`, data);
  return res.data;
}
