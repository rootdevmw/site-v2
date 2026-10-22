import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import type { Member } from "@/app/modules/members/types/member.types";
import type { Ministry } from "@/app/modules/ministries/types/ministry.types";
import { DIRECTORY_LIMIT, directoryParams, groupDirectoryEntry, memberDirectoryEntry, type DirectoryFilters, type DirectoryHomecell, type DirectoryKind, type DirectoryPage } from "@/lib/utils/directory-records";

export async function getDirectoryPage(kind: Exclude<DirectoryKind, "homecells">, filters: DirectoryFilters, signal?: AbortSignal): Promise<DirectoryPage> {
  const params = Object.fromEntries(directoryParams(kind, filters, false));
  const response = await api.get<ApiResponse<Member> | ApiResponse<Ministry>>("/" + kind, {
    params: { ...params, page: filters.page, limit: DIRECTORY_LIMIT }, signal, timeout: 15000, silent: true,
  });
  const payload = response.data;
  const total = payload.meta?.total;
  const limit = payload.meta?.limit;
  if (payload.success === false || !Array.isArray(payload.data) || typeof total !== "number" || !Number.isSafeInteger(total) || total < 0 || typeof limit !== "number" || !Number.isSafeInteger(limit) || limit <= 0) {
    throw new Error("The directory returned an incomplete page.");
  }
  if ((!payload.data.length && total > (filters.page - 1) * limit) || payload.data.length > limit || payload.data.length > total) throw new Error("The directory returned an inconsistent page.");
  return {
    data: kind === "members" ? (payload.data as Member[]).map(memberDirectoryEntry) : (payload.data as Ministry[]).map(groupDirectoryEntry),
    total, limit,
  };
}

// This endpoint returns the full collection and ignores page/search parameters.
// Keep its response separate from the server-paginated directory contracts.
export async function getHomecellDirectory(signal?: AbortSignal) {
  const response = await api.get<ApiResponse<DirectoryHomecell>>("/homecells", { signal, timeout: 15000, silent: true });
  if (response.data.success === false || !Array.isArray(response.data.data)) throw new Error("The homecell directory could not be read.");
  return response.data.data.filter((record) => !record.deletedAt).map(groupDirectoryEntry);
}

export async function exportMemberDirectory(filters: DirectoryFilters, signal?: AbortSignal) {
  const response = await api.get<Blob>("/members/export/xlsx", {
    params: Object.fromEntries(directoryParams("members", filters, false)), responseType: "blob", signal, timeout: 30000, silent: true,
  });
  return response.data;
}

export async function deleteDirectoryRecord(kind: DirectoryKind, id: string) {
  return api.delete("/" + kind + "/" + encodeURIComponent(id), { timeout: 30000, silent: true });
}
