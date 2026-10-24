import { savePublicationEditor } from "@/lib/api/publication-editor";
import type { PublicationEditorPayload } from "@/lib/utils/publication-editor";

export function createPublication(data: PublicationEditorPayload) {
  return savePublicationEditor(data);
}
