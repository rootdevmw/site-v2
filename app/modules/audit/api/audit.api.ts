import { api } from "@/lib/api/client";
import type { AuditEntry } from "../types/audit.types";
import { getAuditEntity } from "@/config/audit-entities";
import { sanitizeAuditEntry } from "@/lib/utils/audit-records";

export async function getAuditLogs(params: { entity: string; page?: number; limit?: number; action?: string; search?: string; actionSearch?: string; actorId?: string; from?: string; to?: string }, signal?: AbortSignal) {
  const response = await api.get<{ data: AuditEntry[]; meta: { page: number; limit: number; total: number } }>("/audit/" + encodeURIComponent(getAuditEntity(params.entity).key), {
    params: { page: params.page, limit: params.limit, action: params.action, search: params.search, actionSearch: params.actionSearch, actorId: params.actorId, from: params.from, to: params.to },
    signal, timeout: 15000, silent: true,
  });
  return { ...response.data, data: response.data.data.map(sanitizeAuditEntry) };
}

export async function getAuditTimeline(params: { entity: string; id: string }, signal?: AbortSignal) {
  const response = await api.get<{ data: AuditEntry[] }>("/audit/" + encodeURIComponent(getAuditEntity(params.entity).key) + "/" + encodeURIComponent(params.id), { signal, timeout: 15000, silent: true });
  return response.data.data.map(sanitizeAuditEntry);
}

export async function searchAuditLogs(params: { search: string; page?: number; limit?: number }) {
  const response = await api.get("/audit/search", { params });
  return response.data;
}
