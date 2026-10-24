import { z } from "zod";

export type AttentionQueueKind = "prayers" | "visitors";
export type AttentionQueueFilters = { page: number; search: string; status: string; urgent: string; from: string; to: string; sort: string };
const id = z.string().regex(/^[1-9]\d*$/);
const date = z.string().refine((value) => Number.isFinite(Date.parse(value)));
const common = { id, name: z.string().nullable(), createdAt: date, status: z.string() };
export const prayerQueueSchema = z.object({ ...common, prayerFor: z.string(), requestPreview: z.string().max(240), hasMoreRequest: z.boolean(), requestType: z.string().nullable(), isUrgent: z.boolean(), shareWithElders: z.boolean() });
export const visitorQueueSchema = z.object({ ...common, phone: z.string().nullable(), email: z.string().nullable(), visitDate: date, groupSize: z.string(), language: z.string().nullable(), hasSpecialNeeds: z.boolean() });
export type PrayerQueueEntry = z.infer<typeof prayerQueueSchema>;
export type VisitorQueueEntry = z.infer<typeof visitorQueueSchema>;
export type AttentionQueueEntry = PrayerQueueEntry | VisitorQueueEntry;
export type AttentionQueuePage = { data: AttentionQueueEntry[]; total: number; limit: number; canRecord: boolean };
export const attentionQueueInfo = {
  prayers: { title: "Prayer requests", description: "Give each request time and care. Review the full request before recording prayer.", openLabel: "Awaiting prayer", dateLabel: "Received", defaultSort: "priority" },
  visitors: { title: "Visitor follow-up", description: "Welcome people into church life and acknowledge each visit with care.", openLabel: "Awaiting welcome", dateLabel: "Visit date", defaultSort: "oldest" },
} as const;
export function queueStatuses(kind: AttentionQueueKind) {
  return kind === "prayers" ? [{ value: "open", label: "Awaiting prayer" }, { value: "PENDING", label: "Pending" }, { value: "REVIEWED", label: "Reviewed" }, { value: "PRAYED_FOR", label: "Prayed for" }, { value: "all", label: "All statuses" }] : [{ value: "open", label: "Awaiting welcome" }, { value: "CONFIRMED", label: "Acknowledged" }, { value: "COMPLETED", label: "Completed" }, { value: "all", label: "All statuses" }];
}
export function readAttentionQueueFilters(kind: AttentionQueueKind, params: Pick<URLSearchParams, "get">): AttentionQueueFilters {
  const page = Number(params.get("page"));
  const status = params.get("status")?.trim() || "open";
  return { page: Number.isSafeInteger(page) && page > 0 ? page : 1, search: params.get("search")?.trim() || "", status: kind === "visitors" && status === "PENDING" ? "open" : status, urgent: kind === "prayers" ? params.get("urgent") || "" : "", from: params.get("from") || "", to: params.get("to") || "", sort: params.get("sort") || attentionQueueInfo[kind].defaultSort };
}
export function attentionQueueParams(kind: AttentionQueueKind, filters: AttentionQueueFilters, paged = true) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status !== "open") params.set("status", filters.status);
  if (kind === "prayers" && filters.urgent) params.set("urgent", filters.urgent);
  for (const key of ["from", "to"] as const) if (filters[key]) params.set(key, filters[key]);
  if (filters.sort !== attentionQueueInfo[kind].defaultSort) params.set("sort", filters.sort);
  if (paged && filters.page > 1) params.set("page", String(filters.page));
  return params;
}
export function attentionQueueHref(kind: AttentionQueueKind, filters: AttentionQueueFilters) {
  const query = attentionQueueParams(kind, filters).toString();
  return "/dashboard/attention/" + kind + (query ? "?" + query : "");
}
export function attentionQueueFilterError(kind: AttentionQueueKind, filters: AttentionQueueFilters) {
  if (!queueStatuses(kind).some(({ value }) => value === filters.status)) return "Choose a valid queue status.";
  if (filters.search.length > 200) return "Keep search terms within 200 characters.";
  if (filters.urgent && !["true", "false"].includes(filters.urgent)) return "Choose a valid urgency filter.";
  if (!(kind === "prayers" ? ["priority", "oldest", "newest"] : ["oldest", "newest"]).includes(filters.sort)) return "Choose a valid queue order.";
  for (const value of [filters.from, filters.to].filter(Boolean)) {
    const parsed = new Date(value + "T00:00:00Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return "Choose valid calendar dates.";
  }
  return filters.from && filters.to && filters.from > filters.to ? "The end date must follow the start date." : "";
}
export function attentionQueueOrderLabel(kind: AttentionQueueKind, sort: string) {
  if (sort === "priority") return "Urgent first, then oldest received";
  if (kind === "visitors") return sort === "newest" ? "Latest visit dates first" : "Earliest visit dates first";
  return sort === "newest" ? "Newest received first" : "Oldest received first";
}
