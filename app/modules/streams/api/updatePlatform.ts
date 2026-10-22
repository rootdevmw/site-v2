import { saveStreamPlatform } from "@/lib/api/stream-editor";
import type { StreamPlatformValues } from "@/lib/utils/stream-editor";

export function updatePlatform(id: string, data: StreamPlatformValues) {
  return saveStreamPlatform(data, id);
}
