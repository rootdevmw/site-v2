import { z } from "zod";
import { getPaginationHref } from "@/lib/utils/pagination";
import {
  readGroupFilters,
  type GroupSearchParams,
} from "@/lib/utils/public-groups";
import { church } from "@/config/church";

const id = z
  .union([z.string().trim().min(1), z.number().int().nonnegative()])
  .transform(String);
const slug = z
  .string()
  .min(1)
  .refine(
    (value) =>
      value !== "." && value !== ".." && !/[\u0000-\u001f\u007f]/.test(value),
  );
const archived = (value: unknown) =>
  Boolean(
    value &&
    typeof value === "object" &&
    "deletedAt" in value &&
    value.deletedAt,
  );
const instant = z.iso.datetime({ offset: true });
const schema = z
  .object({
    id,
    slug,
    title: z.string().trim().min(1),
    description: z.string().nullish(),
    location: z.string().nullish(),
    startTime: instant,
    endTime: instant,
    type: z.preprocess(
      (value) => (archived(value) ? null : value),
      z.object({ id, name: z.string() }).nullish(),
    ),
    ministries: z.preprocess(
      (value) =>
        Array.isArray(value)
          ? value
              .map((item) => item?.ministry ?? item)
              .filter((item) => !archived(item))
          : (value ?? []),
      z.array(z.object({ id, slug, name: z.string().trim().min(1) })),
    ),
  })
  .refine(
    (value) =>
      new Date(value.endTime).getTime() > new Date(value.startTime).getTime(),
  );
export type PublicEvent = z.infer<typeof schema>;
export type EventFilters = {
  page: number;
  q: string;
  period: "upcoming" | "past";
};
export type EventSearchParams = GroupSearchParams;
export const EVENT_PAGE_SIZE = 6;
export function parsePublicEvent(value: unknown) {
  if (archived(value)) throw new Error("Event unavailable");
  const parsed = schema.parse(value);
  return {
    ...parsed,
    ministries: [
      ...new Map(parsed.ministries.map((group) => [group.id, group])).values(),
    ],
  };
}
export function publicEventPage(response: unknown, checkedAt = Date.now()) {
  const parsed = z
    .object({
      success: z.boolean().optional(),
      data: z.array(z.unknown()),
      meta: z.object({
        total: z.number().int().nonnegative(),
        limit: z.number().int().positive().max(50),
      }),
    })
    .parse(response);
  if (parsed.success === false || parsed.meta.total < parsed.data.length)
    throw new Error("Events unavailable");
  return {
    data: parsed.data.map(parsePublicEvent),
    total: parsed.meta.total,
    totalPages: Math.max(1, Math.ceil(parsed.meta.total / parsed.meta.limit)),
    checkedAt,
  };
}
export function readEventFilters(params: EventSearchParams): EventFilters {
  return {
    ...readGroupFilters(params),
    period: params.period === "past" ? "past" : "upcoming",
  };
}
export function eventsHref(
  filters: EventFilters,
  updates: Partial<EventFilters> = {},
) {
  const next = { ...filters, ...updates };
  return getPaginationHref("/events", next.page, {
    q: next.q,
    period: next.period === "past" ? "past" : "",
  });
}
export function eventHref(slug: string, from?: string) {
  return (
    "/events/" +
    encodeURIComponent(slug) +
    (from && from !== "/events" ? "?" + new URLSearchParams({ from }) : "")
  );
}
export function eventsReturnHref(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return "/events";
  try {
    const url = new URL(value, "https://church.invalid");
    if (url.origin !== "https://church.invalid" || url.pathname !== "/events")
      return "/events";
    const params: EventSearchParams = {};
    for (const key of ["page", "q", "period"])
      if (url.searchParams.getAll(key).length === 1)
        params[key] = url.searchParams.get(key) ?? undefined;
    return eventsHref(readEventFilters(params));
  } catch {
    return "/events";
  }
}
export function eventState(event: PublicEvent, now: number) {
  return new Date(event.endTime).getTime() <= now
    ? "past"
    : new Date(event.startTime).getTime() <= now
      ? "ongoing"
      : "upcoming";
}
export function eventEnquiryHref(event: PublicEvent) {
  return (
    church.whatsappUrl +
    "?" +
    new URLSearchParams({
      text: `Hello, I would like to ask about ${event.title} at Church of Christ at Red Cross.`,
    })
  );
}
