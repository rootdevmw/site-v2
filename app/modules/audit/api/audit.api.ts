import { api } from "@/lib/api/client";

// -----------------------------
// NORMALIZER
// -----------------------------
function normalizeEntity(entity: string) {
  return entity
    .trim()
    .replace(/-/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase();
}

// -----------------------------
// GET ENTITY AUDIT LOGS
// -----------------------------
export async function getAuditLogs(params: {
  entity: string;
  page?: number;
  limit?: number;
  action?: string;
  search?: string;
}) {
  const res = await api.get(`/audit/${normalizeEntity(params.entity)}`, {
    params: {
      page: params.page,
      limit: params.limit,
      action: params.action,
      search: params.search,
    },
  });

  return res.data; //  keep meta + data
}

// -----------------------------
// GET ENTITY TIMELINE
// -----------------------------
export async function getAuditTimeline(params: { entity: string; id: string }) {
  const res = await api.get(
    `/audit/${normalizeEntity(params.entity)}/${params.id}`,
  );

  return res.data.data;
}

// -----------------------------
// GLOBAL SEARCH
// -----------------------------
export async function searchAuditLogs(params: {
  search: string;
  page?: number;
  limit?: number;
}) {
  const res = await api.get("/audit/search", {
    params,
  });

  return res.data;
}
