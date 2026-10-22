import { saveStreamPlatform } from "@/lib/api/stream-editor";
import type { StreamPlatformValues } from "@/lib/utils/stream-editor";

export type CreatePlatformPayload = StreamPlatformValues;

export function createPlatform(data: StreamPlatformValues) {
  return saveStreamPlatform(data);
}
