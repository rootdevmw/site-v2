import { api } from "@/lib/api/client";
import { Platform } from "../types/stream.types";

export type CreatePlatformPayload = {
  name: string;
  url: string;
};

export async function createPlatform(
  data: CreatePlatformPayload,
): Promise<{ data: Platform }> {
  const res = await api.post("/streams/platforms", data);
  return res.data;
}
