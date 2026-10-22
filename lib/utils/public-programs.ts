import { z } from "zod";
import { church } from "@/config/church";
import { getPaginationHref } from "./pagination";
import { readGroupFilters, type GroupSearchParams } from "./public-groups";
import {
  getProgramDateValue,
  getOrderedProgramItems,
  getProgramTime,
} from "./program-records";
import { formatChurchDate } from "./church-date";

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
const named = z.object({ id, name: z.string().trim().min(1) });
const optionalActive = <T extends z.ZodType>(value: T) =>
  z.preprocess((input) => (archived(input) ? null : input), value.nullish());
const item = z.object({
  id,
  title: z.string(),
  description: z.string().nullish(),
  time: z.string().nullish(),
  sequence: z.number().int(),
  responsible: optionalActive(
    z.object({
      id,
      firstName: z.string(),
      lastName: z.string(),
      prefix: z.string().nullish(),
    }),
  ),
});
const schema = z.object({
  id,
  slug,
  date: z
    .union([z.iso.date(), z.iso.datetime({ offset: true })])
    .transform(getProgramDateValue),
  location: z.string().nullish(),
  type: optionalActive(named),
  homecell: optionalActive(named.extend({ slug })),
  items: z.preprocess(
    (input) =>
      Array.isArray(input)
        ? input.filter((value) => !archived(value))
        : (input ?? []),
    z.array(item),
  ),
});
export type PublicProgram = z.infer<typeof schema>;
export type ProgramFilters = {
  page: number;
  q: string;
  typeId: string;
  homecellId: string;
  period: "upcoming" | "past";
};
export type ProgramSearchParams = GroupSearchParams;
export const PROGRAM_PAGE_SIZE = 6;
export function parsePublicProgram(value: unknown): PublicProgram {
  if (archived(value)) throw new Error("Program unavailable");
  const parsed = schema.parse(value);
  return {
    ...parsed,
    items: getOrderedProgramItems(
      [...parsed.items].sort((a, b) =>
        a.id.localeCompare(b.id, "en", { numeric: true }),
      ),
    ),
  };
}
export function publicProgramPage(response: unknown, checkedAt = Date.now()) {
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
    throw new Error("Programs unavailable");
  return {
    data: parsed.data.map(parsePublicProgram),
    total: parsed.meta.total,
    totalPages: Math.max(1, Math.ceil(parsed.meta.total / parsed.meta.limit)),
    checkedAt,
  };
}
export function publicProgramTypes(response: unknown) {
  const parsed = z
    .object({ success: z.boolean().optional(), data: z.array(z.unknown()) })
    .parse(response);
  if (parsed.success === false) throw new Error("Program types unavailable");
  const types = parsed.data
    .filter((value) => !archived(value))
    .map((value) => named.parse(value));
  return [...new Map(types.map((type) => [type.id, type])).values()];
}
function recordId(value: unknown) {
  return typeof value === "string" &&
    /^[1-9]\d{0,18}$/.test(value) &&
    BigInt(value) <= BigInt("9223372036854775807")
    ? value
    : "";
}
export function readProgramFilters(
  params: ProgramSearchParams,
): ProgramFilters {
  return {
    ...readGroupFilters(params),
    typeId: recordId(params.typeId),
    homecellId: recordId(params.homecellId),
    period: params.period === "past" ? "past" : "upcoming",
  };
}
export function programsHref(
  filters: ProgramFilters,
  updates: Partial<ProgramFilters> = {},
) {
  const next = { ...filters, ...updates };
  return getPaginationHref("/programs", next.page, {
    q: next.q,
    typeId: next.typeId,
    homecellId: next.homecellId,
    period: next.period === "past" ? "past" : "",
  });
}
export function programHref(slug: string, from?: string) {
  return (
    "/programs/" +
    encodeURIComponent(slug) +
    (from && from !== "/programs" ? "?" + new URLSearchParams({ from }) : "")
  );
}
export function programsReturnHref(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return "/programs";
  try {
    const url = new URL(value, "https://church.invalid");
    if (url.origin !== "https://church.invalid" || url.pathname !== "/programs")
      return "/programs";
    const params: ProgramSearchParams = {};
    for (const key of ["page", "q", "period", "typeId", "homecellId"])
      if (url.searchParams.getAll(key).length === 1)
        params[key] = url.searchParams.get(key) ?? undefined;
    return programsHref(readProgramFilters(params));
  } catch {
    return "/programs";
  }
}
export function programLabel(program: PublicProgram) {
  return (
    (program.type?.name || "Church program") +
    (program.homecell ? ` · ${program.homecell.name}` : "")
  );
}
export function programDateLabel(program: PublicProgram) {
  return formatChurchDate(program.date + "T00:00:00+02:00", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
export function publicProgramPerson(item: PublicProgram["items"][number]) {
  const person = item.responsible;
  const name = [person?.firstName, person?.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
  const prefixes: Record<string, string> = {
    PASTOR: "Pastor",
    ELDER: "Elder",
    DEACON: "Deacon",
    BROTHER: "Brother",
    SISTER: "Sister",
  };
  return name
    ? [
        person?.prefix ? prefixes[person.prefix] || person.prefix.trim() : "",
        name,
      ]
        .filter(Boolean)
        .join(" ")
    : "";
}
export function publicProgramTime(value?: string | null) {
  const time = value?.trim();
  return getProgramTime(
    time && /^\d:[0-5]\d(?::[0-5]\d)?$/.test(time) ? "0" + time : time,
  );
}
export function programEnquiryHref(program: PublicProgram) {
  return (
    church.whatsappUrl +
    "?" +
    new URLSearchParams({
      text: `Hello, I would like to ask about ${programLabel(program)} on ${programDateLabel(program)} at Church of Christ at Red Cross.`,
    })
  );
}
