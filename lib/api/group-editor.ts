import { z } from "zod";
import { api } from "@/lib/api/client";
import { validateManagementPage } from "@/lib/utils/access-lists";
import type { GroupKind } from "@/lib/utils/group-members";
import { groupEditorInfo, type GroupEditorValues, type LeadershipPerson } from "@/lib/utils/group-editor";
const person = z.object({ id: z.string().regex(/^[1-9]\d*$/), firstName: z.string(), lastName: z.string(), prefix: z.string().nullable().optional(), location: z.string().nullable().optional() });
export async function getGroupLeadershipPage(filters: { page: number; search: string }, signal?: AbortSignal) {
  if (!Number.isSafeInteger(filters.page) || filters.page < 1 || filters.search.length > 200) throw new Error("Choose valid leadership search filters.");
  const response = await api.get("/members/leadership-options", { params: { page: filters.page, limit: 20, search: filters.search }, signal, timeout: 15000, silent: true });
  const page = validateManagementPage<unknown>(response.data, filters.page);
  const data: LeadershipPerson[] = page.data.map((entry) => { const value = person.parse(entry); return { id: value.id, name: [value.firstName, value.lastName].filter(Boolean).join(" ").trim() || "Profile #" + value.id, prefix: value.prefix, location: value.location }; });
  if (new Set(data.map((entry) => entry.id)).size !== data.length) throw new Error("The directory returned repeated profiles.");
  return { ...page, data };
}
export async function saveGroupEditor(kind: GroupKind, data: Partial<GroupEditorValues>, id?: string) {
  const path = "/" + groupEditorInfo[kind].plural;
  const response = id ? await api.patch(path + "/" + encodeURIComponent(id), data, { timeout: 30000, silent: true }) : await api.post(path, data, { timeout: 30000, silent: true });
  const result = response.data as { success?: boolean; data?: { id?: string } };
  if (result?.success === false || !result?.data?.id || !/^[1-9]\d*$/.test(result.data.id) || id && result.data.id !== id) throw new Error("The group save could not be confirmed.");
  return { ...result, data: { ...result.data, id: result.data.id } };
}
