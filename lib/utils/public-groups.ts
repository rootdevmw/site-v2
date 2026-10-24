import { z } from "zod";
import { getPaginationHref } from "@/lib/utils/pagination";
import {
  getPublicLeaders,
  type PublicLeader,
} from "@/lib/utils/public-leadership";
import { church } from "@/config/church";
import { getProgramDateValue } from "@/lib/utils/program-records";
import { getChurchDateInputValue } from "@/lib/utils/church-date";

export type PublicGroupKind = "ministry" | "homecell";
export type GroupSearchParams = Record<string, string | string[] | undefined>;
export type GroupFilters = { page: number; q: string };
export const PUBLIC_GROUP_PAGE_SIZE = 6;
export const groupPaths = {
  ministry: "/ministries",
  homecell: "/homecells",
} as const;
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
const person = z.preprocess(
  (value) => (archived(value) ? null : value),
  z
    .object({
      id,
      firstName: z.string(),
      lastName: z.string(),
      prefix: z.string().nullish(),
      imageUrl: z.string().nullish(),
      bio: z.object({ bio: z.string() }).nullish(),
    })
    .nullish(),
);
const event = z.object({
  id,
  slug,
  title: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().nullish(),
});
const program = z.object({
  id,
  slug,
  date: z.string(),
  location: z.string().nullish(),
  type: z.object({ name: z.string() }).nullish(),
});
const activeArray = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value.filter((item) => !archived(item))
        : (value ?? []),
    z.array(schema),
  );
const base = z.object({
  id,
  name: z.string().trim().min(1),
  slug,
  leader: person,
  overseer: person,
});
const ministry = base.extend({
  kind: z.literal("ministry"),
  purpose: z.string().nullish(),
  description: z.string().nullish(),
  events: activeArray(event),
});
const homecell = base.extend({
  kind: z.literal("homecell"),
  location: z.string().nullish(),
  programs: activeArray(program),
});
export type PublicMinistry = z.infer<typeof ministry>;
export type PublicHomecell = z.infer<typeof homecell>;
export type PublicGroup = PublicMinistry | PublicHomecell;

export function parsePublicGroup(
  kind: PublicGroupKind,
  value: unknown,
): PublicGroup {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    archived(value)
  )
    throw new Error("Group unavailable");
  return kind === "ministry"
    ? ministry.parse({ ...value, kind })
    : homecell.parse({ ...value, kind });
}
export function publicGroupPage(kind: PublicGroupKind, response: unknown) {
  const result = z
    .object({
      success: z.boolean().optional(),
      data: z.array(z.unknown()),
      meta: z.object({
        total: z.number().int().nonnegative(),
        limit: z.number().int().positive().max(50),
      }),
    })
    .parse(response);
  if (result.success === false || result.meta.total < result.data.length)
    throw new Error("Groups unavailable");
  return {
    data: result.data.map((item) => parsePublicGroup(kind, item)),
    total: result.meta.total,
    totalPages: Math.max(1, Math.ceil(result.meta.total / result.meta.limit)),
  };
}
export function readGroupFilters(params: GroupSearchParams): GroupFilters {
  const page = typeof params.page === "string" ? params.page.trim() : "";
  return {
    page:
      /^[1-9]\d*$/.test(page) &&
      Number.isSafeInteger(Number(page)) &&
      Number(page) <= 1000000
        ? Number(page)
        : 1,
    q: typeof params.q === "string" ? params.q.trim().slice(0, 200) : "",
  };
}
export function groupsHref(
  kind: PublicGroupKind,
  filters: GroupFilters,
  updates: Partial<GroupFilters> = {},
) {
  const next = { ...filters, ...updates };
  return getPaginationHref(groupPaths[kind], next.page, { q: next.q });
}
export function groupHref(kind: PublicGroupKind, slug: string, from?: string) {
  return (
    groupPaths[kind] +
    "/" +
    encodeURIComponent(slug) +
    (from && from !== groupPaths[kind]
      ? "?" + new URLSearchParams({ from })
      : "")
  );
}
export function groupReturnHref(kind: PublicGroupKind, value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return groupPaths[kind];
  try {
    const url = new URL(value, "https://church.invalid");
    if (
      url.origin !== "https://church.invalid" ||
      url.pathname !== groupPaths[kind]
    )
      return groupPaths[kind];
    const params: GroupSearchParams = {};
    for (const key of ["page", "q"])
      if (url.searchParams.getAll(key).length === 1)
        params[key] = url.searchParams.get(key) ?? undefined;
    return groupsHref(kind, readGroupFilters(params));
  } catch {
    return groupPaths[kind];
  }
}
export function groupPeople(group: PublicGroup) {
  const result = new Map<string, PublicLeader & { roles: string[] }>();
  for (const [role, member] of [
    ["Leader", group.leader],
    ["Overseer", group.overseer],
  ] as const) {
    if (
      !member ||
      ![member.firstName, member.lastName].some((name) => name.trim())
    )
      continue;
    const profile = getPublicLeaders([member])[0],
      existing = result.get(profile.id);
    if (existing) existing.roles.push(role);
    else result.set(profile.id, { ...profile, roles: [role] });
  }
  return [...result.values()];
}
export function upcomingGroupEvents(group: PublicMinistry, now = Date.now()) {
  return group.events
    .filter(
      (item) =>
        Number.isFinite(new Date(item.startTime).getTime()) &&
        Number.isFinite(new Date(item.endTime).getTime()) &&
        new Date(item.endTime).getTime() > now &&
        new Date(item.endTime).getTime() >= new Date(item.startTime).getTime(),
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime() ||
        a.id.localeCompare(b.id, "en", { numeric: true }),
    );
}
export function upcomingGroupPrograms(group: PublicHomecell, now = Date.now()) {
  const today = getChurchDateInputValue(new Date(now));
  return group.programs
    .filter((item) => {
      const day = getProgramDateValue(item.date);
      return Boolean(day && day >= today);
    })
    .sort(
      (a, b) =>
        getProgramDateValue(a.date).localeCompare(
          getProgramDateValue(b.date),
        ) || a.id.localeCompare(b.id, "en", { numeric: true }),
    );
}
export function groupEnquiryHref(group: PublicGroup) {
  return (
    church.whatsappUrl +
    "?" +
    new URLSearchParams({
      text: `Hello, I would like to learn more about ${group.name} ${group.kind === "ministry" ? "ministry" : "homecell"} and how to get involved.`,
    })
  );
}
