import { z } from "zod";
import { api } from "@/lib/api/client";
import { validateManagementPage } from "@/lib/utils/access-lists";
import { getOrderedProgramItems } from "@/lib/utils/program-records";
import type {
  ProgramEditorKind,
  programEditorPayload,
} from "@/lib/utils/program-editor";
const id = z.string().regex(/^[1-9]\d*$/);
const option = z.object({ id, name: z.string() });
const template = z.object({
  id,
  name: z.string(),
  type: option,
  homecellId: id.nullable().optional(),
  homecell: option.nullable().optional(),
  items: z.array(
    z.object({
      id,
      title: z.string(),
      description: z.string().nullable().optional(),
      time: z.string().nullable().optional(),
      sequence: z.number(),
      responsibleId: id.nullable().optional(),
      responsible: z
        .object({ id, firstName: z.string(), lastName: z.string() })
        .nullable()
        .optional(),
    }),
  ),
});
export async function getProgramTemplateChoices(
  filters: { page: number; search: string },
  signal?: AbortSignal,
) {
  if (
    !Number.isSafeInteger(filters.page) ||
    filters.page < 1 ||
    filters.search.length > 200
  )
    throw new Error("Choose valid template search filters.");
  const response = await api.get("/program-templates", {
    params: { ...filters, limit: 10 },
    signal,
    timeout: 15000,
    silent: true,
  });
  const page = validateManagementPage<unknown>(response.data, filters.page);
  const data = page.data.map((entry) => option.parse(entry));
  if (new Set(data.map((entry) => entry.id)).size !== data.length)
    throw new Error("Templates returned repeated records.");
  return { ...page, data };
}
export async function getProgramEditorTemplate(
  id: string,
  signal?: AbortSignal,
) {
  const response = await api.get(
    "/program-templates/" + encodeURIComponent(id),
    { signal, timeout: 15000, silent: true },
  );
  const result = z
    .object({ success: z.boolean().optional(), data: template })
    .parse(response.data);
  if (result.success === false || result.data.id !== id)
    throw new Error("Template details could not be confirmed.");
  return { ...result.data, items: getOrderedProgramItems(result.data.items) };
}
export async function saveProgramEditor(
  kind: ProgramEditorKind,
  data: ReturnType<typeof programEditorPayload>,
  id?: string,
) {
  const path = kind === "program" ? "/programs" : "/program-templates";
  const response = id
    ? await api.patch(path + "/" + encodeURIComponent(id), data, {
        timeout: 30000,
        silent: true,
      })
    : await api.post(path, data, { timeout: 30000, silent: true });
  const result = z
    .object({
      success: z.boolean().optional(),
      data: z.object({ id: z.string().regex(/^[1-9]\d*$/) }),
    })
    .parse(response.data);
  if (result.success === false || (id && result.data.id !== id))
    throw new Error("The save could not be confirmed.");
  return result;
}
