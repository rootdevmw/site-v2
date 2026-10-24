import { saveStreamEditor } from "@/lib/api/stream-editor";
import type { StreamEditorPayload } from "@/lib/utils/stream-editor";

export function createStream(data: StreamEditorPayload) {
  return saveStreamEditor(data);
}
