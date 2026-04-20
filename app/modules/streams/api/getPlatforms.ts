import { api } from "@/lib/api/client";
import { Platform } from "../types/stream.types";

export async function getPlatforms(): Promise<{ data: Platform[] }> {
  const res = await api.get("/streams/platforms");
  return res.data;
}
