import { saveStreamEditor } from "@/lib/api/stream-editor";
import type { StreamEditorPayload } from "@/lib/utils/stream-editor";

export function updateStream(id: string, data: StreamEditorPayload) {
  return saveStreamEditor(data, id);
}
