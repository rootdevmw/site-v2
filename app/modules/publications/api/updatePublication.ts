import { savePublicationEditor } from "@/lib/api/publication-editor";
import type { PublicationEditorPayload } from "@/lib/utils/publication-editor";

export function updatePublication(id: string, data: PublicationEditorPayload) {
  return savePublicationEditor(data, id);
}
