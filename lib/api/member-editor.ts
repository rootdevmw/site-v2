import { z } from "zod";
import { api } from "./client";
import { validateManagementPage } from "@/lib/utils/access-lists";
const option = z.object({ id: z.string().regex(/^[1-9]\d*$/), name: z.string(), deletedAt: z.string().nullable().optional() });
export type MemberGroupOption = { id: string; name: string };
export async function getMemberEditorOptions(kind: "homecells" | "ministries", signal?: AbortSignal): Promise<MemberGroupOption[]> {
  const records = new Map<string, MemberGroupOption>();
  let page = 1;
  let total = 0;
  do {
    signal?.throwIfAborted();
    const response = await api.get("/" + kind, { ...(kind === "ministries" && { params: { page, limit: 100 } }), signal, timeout: 15000, silent: true });
    signal?.throwIfAborted();
    const payload = response.data;
    if (payload?.success === false || !Array.isArray(payload?.data)) throw new Error("Church connections could not be loaded.");
    const rows = kind === "ministries" ? validateManagementPage<unknown>(payload, page).data : payload.data as unknown[];
    const previous = records.size;
    for (const row of rows) { const entry = option.parse(row); if (!entry.deletedAt) { if (records.has(entry.id)) throw new Error("Church connections returned repeated records."); records.set(entry.id, { id: entry.id, name: entry.name }); } }
    total = kind === "ministries" ? payload.meta.total : records.size;
    if (kind === "homecells") break;
    if (total > records.size && records.size === previous) throw new Error("The complete ministry list could not be loaded.");
    page++;
  } while (records.size < total);
  return [...records.values()].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
export async function uploadMemberPhoto(file: File) {
  const body = new FormData(); body.append("file", file);
  const response = await api.post("/content/upload", body, { timeout: 60000, silent: true });
  const url = response.data?.data?.url;
  if (response.data?.success === false || typeof url !== "string" || !/^https?:\/\//i.test(url) && !/^\/(?!\/)/.test(url) || url.length > 191) throw new Error("The uploaded photograph URL could not be confirmed.");
  return url;
}
export function confirmedMemberWrite(response: { success?: boolean; data?: { id?: string } }, id?: string) {
  if (response?.success === false || !response?.data?.id || !/^[1-9]\d*$/.test(response.data.id) || id && response.data.id !== id) throw new Error("The member save could not be confirmed.");
  return { ...response, data: { ...response.data, id: response.data.id } };
}
