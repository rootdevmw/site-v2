import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import type { Content } from "@/app/modules/content/types/content.types";
import type { Publication } from "@/app/modules/publications/types/publication.types";
import { DIRECTORY_LIMIT } from "@/lib/utils/directory-records";
import { contentListEntry, editorialParams, publicationListEntry, streamListEntry, type EditorialFilters, type EditorialKind, type EditorialPage, type EditorialStream } from "@/lib/utils/editorial-lists";

export async function getEditorialList(kind: EditorialKind, filters: EditorialFilters, signal?: AbortSignal): Promise<EditorialPage> {
  const response = await api.get<ApiResponse<Content | Publication | EditorialStream>>("/" + kind, {
    params: { ...Object.fromEntries(editorialParams(kind, filters, false)), page: filters.page, limit: DIRECTORY_LIMIT }, signal, timeout: 15000, silent: true,
  });
  const { data, meta, success } = response.data;
  const total = meta?.total;
  const limit = meta?.limit;
  if (success === false || !Array.isArray(data) || typeof total !== "number" || !Number.isSafeInteger(total) || total < 0 || typeof limit !== "number" || !Number.isSafeInteger(limit) || limit < 1) throw new Error("The list returned an incomplete page.");
  if ((!data.length && total > (filters.page - 1) * limit) || data.length > limit || data.length > total) throw new Error("The list returned an inconsistent page.");
  return { data: data.map((record) => kind === "content" ? contentListEntry(record as Content) : kind === "publications" ? publicationListEntry(record as Publication) : streamListEntry(record as EditorialStream)), total, limit };
}

export async function getEditorialOptions(kind: "content" | "streams", signal?: AbortSignal) {
  const response = await api.get<{ success?: boolean; data: { id: string; name: string }[] }>(kind === "content" ? "/content/types" : "/streams/platforms", { signal, timeout: 15000, silent: true });
  if (response.data.success === false || !Array.isArray(response.data.data)) throw new Error("Filter choices could not be read.");
  return response.data.data.map(({ id, name }) => ({ id, name }));
}

export async function deleteEditorialRecord(kind: EditorialKind, id: string) {
  const response = await api.delete<{ success?: boolean }>("/" + kind + "/" + encodeURIComponent(id), { timeout: 30000, silent: true });
  if (response.data.success === false) throw new Error("Deletion could not be confirmed.");
  return response.data;
}
