import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import type { Program } from "@/app/modules/programs/types/program.types";
import type { ProgramTemplate } from "@/app/modules/programTemplates/types/programTemplate.types";
import { DIRECTORY_LIMIT } from "@/lib/utils/directory-records";
import { eventListEntry, programListEntry, scheduleFilterError, scheduleParams, templateListEntry, type ScheduleEvent, type ScheduleFilters, type ScheduleKind, type SchedulePage } from "@/lib/utils/schedule-lists";

export async function getScheduleList(kind: ScheduleKind, filters: ScheduleFilters, signal?: AbortSignal): Promise<SchedulePage> {
  const error = scheduleFilterError(filters);
  if (error) throw new Error(error);
  const response = await api.get<ApiResponse<ScheduleEvent | Program | ProgramTemplate>>("/" + kind, {
    params: { ...Object.fromEntries(scheduleParams(kind, filters, false)), page: filters.page, limit: DIRECTORY_LIMIT }, signal, timeout: 15000, silent: true,
  });
  const { data, meta, success } = response.data;
  const total = meta?.total;
  const limit = meta?.limit;
  if (success === false || !Array.isArray(data) || typeof total !== "number" || !Number.isSafeInteger(total) || total < 0 || typeof limit !== "number" || !Number.isSafeInteger(limit) || limit < 1) throw new Error("The list returned an incomplete page.");
  if ((!data.length && total > (filters.page - 1) * limit) || data.length > limit || data.length > total) throw new Error("The list returned an inconsistent page.");
  return {
    data: data.map((record) => kind === "events" ? eventListEntry(record as ScheduleEvent) : kind === "programs" ? programListEntry(record as Program) : templateListEntry(record as ProgramTemplate)),
    total, limit,
  };
}

export type ScheduleOption = { id: string; name: string };
export async function getScheduleTypes(kind: "events" | "programs", signal?: AbortSignal) {
  const response = await api.get<{ success?: boolean; data: ScheduleOption[] }>("/" + kind + "/types", { signal, timeout: 15000, silent: true });
  if (response.data.success === false || !Array.isArray(response.data.data)) throw new Error("Types could not be read.");
  return response.data.data.map(({ id, name }) => ({ id, name }));
}

export async function deleteScheduleRecord(kind: ScheduleKind, id: string) {
  const response = await api.delete<{ success?: boolean }>("/" + kind + "/" + encodeURIComponent(id), { timeout: 30000, silent: true });
  if (response.data.success === false) throw new Error("Deletion could not be confirmed.");
  return response.data;
}
