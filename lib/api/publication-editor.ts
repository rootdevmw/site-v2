import { z } from "zod";
import { api } from "@/lib/api/client";
import type { PublicationEditorPayload } from "@/lib/utils/publication-editor";

export async function savePublicationEditor(
  data: PublicationEditorPayload,
  id?: string,
) {
  if (id !== undefined && !/^[1-9]\d*$/.test(id))
    throw new Error("Choose a valid publication.");
  const body = new FormData();
  if (data.title !== undefined) body.append("title", data.title);
  if (data.description !== undefined)
    body.append("description", data.description);
  // Multipart has no null value. An empty date explicitly returns a record to Draft.
  if (data.publishedAt !== undefined)
    body.append("publishedAt", data.publishedAt ?? "");
  if (data.file) body.append("file", data.file);
  const config = { timeout: 60000, silent: true };
  const response =
    id !== undefined
      ? await api.patch("/publications/" + encodeURIComponent(id), body, config)
      : await api.post("/publications", body, config);
  const result = z
    .object({
      success: z.boolean().optional(),
      data: z.object({ id: z.string().regex(/^[1-9]\d*$/) }),
    })
    .parse(response.data);
  if (result.success === false || (id !== undefined && result.data.id !== id))
    throw new Error("Publication save could not be confirmed.");
  return result;
}
