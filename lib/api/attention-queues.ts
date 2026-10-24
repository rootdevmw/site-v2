import { api } from "@/lib/api/client";
import { validateManagementPage } from "@/lib/utils/access-lists";
import { DIRECTORY_LIMIT } from "@/lib/utils/directory-records";
import { attentionQueueFilterError, attentionQueueParams, prayerQueueSchema, visitorQueueSchema, type AttentionQueueEntry, type AttentionQueueFilters, type AttentionQueueKind, type AttentionQueuePage } from "@/lib/utils/attention-queues";

export async function getAttentionQueue(kind: AttentionQueueKind, filters: AttentionQueueFilters, signal?: AbortSignal): Promise<AttentionQueuePage> {
  const failure = attentionQueueFilterError(kind, filters);
  if (failure) throw new Error(failure);
  const response = await api.get<{ success?: boolean; data: AttentionQueueEntry[]; meta?: { page?: number; limit?: number; total?: number; canRecord?: boolean } }>("/attention/queues/" + kind, { params: { ...Object.fromEntries(attentionQueueParams(kind, filters, false)), page: filters.page, limit: DIRECTORY_LIMIT }, signal, timeout: 15000, silent: true });
  const page = validateManagementPage(response.data, filters.page);
  if (typeof response.data.meta?.canRecord !== "boolean") throw new Error("Follow-up permissions could not be confirmed.");
  const schema = kind === "prayers" ? prayerQueueSchema : visitorQueueSchema;
  return { ...page, data: page.data.map((entry) => schema.parse(entry)), canRecord: response.data.meta.canRecord };
}
