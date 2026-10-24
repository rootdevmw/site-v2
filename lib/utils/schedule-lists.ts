import type { Event } from "@/app/modules/events/types/event.types";
import type { Program } from "@/app/modules/programs/types/program.types";
import type { ProgramTemplate } from "@/app/modules/programTemplates/types/programTemplate.types";
import { getOrderedProgramItems, getProgramDateValue, getProgramSummary, isProgramDate } from "./program-records";
import { getRelatedMinistries, type MinistryRelationship, type RelatedRecord } from "./record-details";

export type ScheduleKind = "events" | "programs" | "program-templates";
export const scheduleInfo = {
  events: { title: "Events", singular: "event", description: "Plan church gatherings and keep their schedules and ministry connections clear." },
  programs: { title: "Programs", singular: "program", description: "Find an order of service, review its activities, and see who is responsible." },
  "program-templates": { title: "Program templates", singular: "template", description: "Preview a reusable order of activities, then choose a date to create a program." },
} as const;
export type ScheduleFilters = { page: number; search: string; typeId: string; homecellId: string; startDate: string; endDate: string; date: string; fromDate: string };

export function readScheduleFilters(kind: ScheduleKind, params: Pick<URLSearchParams, "get">): ScheduleFilters {
  const page = Number(params.get("page"));
  const id = (key: string) => /^[1-9]\d*$/.test(params.get(key) ?? "") ? params.get(key)! : "";
  const text = (key: string) => params.get(key)?.trim() ?? "";
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    search: kind === "programs" ? "" : text("search"), typeId: id("typeId"),
    homecellId: kind === "events" ? "" : id("homecellId"),
    startDate: kind === "events" ? text("startDate") : "", endDate: kind === "events" ? text("endDate") : "",
    date: kind === "programs" ? text("date") : "", fromDate: kind === "programs" ? text("fromDate") : "",
  };
}

export function scheduleFilterError(filters: ScheduleFilters) {
  if ([filters.startDate, filters.endDate, filters.date, filters.fromDate].some((value) => value && !isProgramDate(value))) return "Choose valid calendar dates for your filters.";
  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) return "The end date must be on or after the start date.";
  if (filters.date && filters.fromDate) return "Choose either a single program date or a starting date, then apply your filters.";
  return "";
}

export function scheduleParams(kind: ScheduleKind, filters: ScheduleFilters, paged = true) {
  const params = new URLSearchParams();
  const keys = kind === "events" ? ["search", "typeId", "startDate", "endDate"] as const : kind === "programs" ? ["typeId", "homecellId", "date", "fromDate"] as const : ["search", "typeId", "homecellId"] as const;
  for (const key of keys) if (filters[key]) params.set(key, filters[key]);
  if (paged && filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function scheduleHref(kind: ScheduleKind, filters: ScheduleFilters) {
  const query = scheduleParams(kind, filters).toString();
  return "/dashboard/" + kind + (query ? "?" + query : "");
}

export type ScheduleEntry = {
  id: string; name: string; typeName?: string; location?: string | null;
  startTime?: string; endTime?: string; date?: string;
  homecell?: RelatedRecord | null; ministries?: RelatedRecord[];
  summary?: ReturnType<typeof getProgramSummary>; preview?: string[];
};
export type SchedulePage = { data: ScheduleEntry[]; total: number; limit: number };
export type ScheduleEvent = Omit<Event, "ministries"> & { ministries?: (MinistryRelationship | null)[] | null };

export function eventListEntry(event: ScheduleEvent): ScheduleEntry {
  return { id: event.id, name: event.title, typeName: event.type?.name, location: event.location, startTime: event.startTime, endTime: event.endTime, ministries: Array.isArray(event.ministries) ? getRelatedMinistries(event.ministries) : undefined };
}

function programContext(record: Program | ProgramTemplate) {
  const homecellId = record.homecell?.id || record.homecellId;
  // Missing activity data is different from a supplied empty activity list.
  const items = Array.isArray(record.items) ? record.items.filter((item) => !("deletedAt" in item && item.deletedAt)) : undefined;
  return {
    id: record.id, typeName: record.type?.name,
    homecell: homecellId ? { id: homecellId, name: record.homecell?.name || "Assigned homecell #" + homecellId } : null,
    summary: items ? getProgramSummary(items) : undefined,
    preview: items ? getOrderedProgramItems(items).slice(0, 3).map((item) => item.title) : undefined,
  };
}

export function programListEntry(program: Program): ScheduleEntry {
  return { ...programContext(program), name: program.type?.name || "Church program", date: getProgramDateValue(program.date), location: program.location };
}

export function templateListEntry(template: ProgramTemplate): ScheduleEntry {
  return { ...programContext(template), name: template.name };
}

export function scheduleOrderLabel(kind: ScheduleKind, filters: ScheduleFilters) {
  return kind === "events" ? "Earliest start first" : kind === "program-templates" ? "Newest added first" : filters.fromDate ? "Earliest date first" : "Latest date first";
}
