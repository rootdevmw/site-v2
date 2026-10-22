import { z } from "zod";
import { api } from "@/lib/api/client";
import { validateManagementPage } from "@/lib/utils/access-lists";
import type { contentEditorPayload } from "@/lib/utils/content-editor";
const person = z.object({
  id: z.string().regex(/^[1-9]\d*$/),
  firstName: z.string(),
  lastName: z.string(),
});
export async function getContentAuthorOptions(
  filters: { page: number; search: string },
  signal?: AbortSignal,
) {
  if (
    !Number.isSafeInteger(filters.page) ||
    filters.page < 1 ||
    filters.search.length > 200
  )
    throw new Error("Choose valid author search filters.");
  const response = await api.get("/content/author-options", {
    params: { ...filters, limit: 20 },
    signal,
    timeout: 15000,
    silent: true,
  });
  const page = validateManagementPage<unknown>(response.data, filters.page);
  const data = page.data.map((entry) => {
    const value = person.parse(entry);
    return {
      id: value.id,
      name:
        [value.firstName, value.lastName].filter(Boolean).join(" ").trim() ||
        "Profile #" + value.id,
    };
  });
  if (new Set(data.map((entry) => entry.id)).size !== data.length)
    throw new Error("The author directory returned repeated profiles.");
  return { ...page, data };
}
export async function saveContentEditor(
  data: ReturnType<typeof contentEditorPayload>,
  id?: string,
) {
  const response = id
    ? await api.patch("/content/" + encodeURIComponent(id), data, {
        timeout: 30000,
        silent: true,
      })
    : await api.post("/content", data, { timeout: 30000, silent: true });
  const result = z
    .object({
      success: z.boolean().optional(),
      data: z.object({ id: z.string().regex(/^[1-9]\d*$/) }),
    })
    .parse(response.data);
  if (result.success === false || (id && result.data.id !== id))
    throw new Error("Message save could not be confirmed.");
  return result;
}
