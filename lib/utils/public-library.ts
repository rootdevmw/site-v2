import { z } from "zod";
import { getWebUrl, getYouTubePreview } from "./editorial-records";
import { getPaginationHref } from "./pagination";
import { readGroupFilters, type GroupSearchParams } from "./public-groups";
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
const stream = z.object({
  id,
  slug,
  title: z.string().trim().min(1),
  isLive: z.boolean(),
  startsAt: instant.nullish(),
  endsAt: instant.nullish(),
  platforms: z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value
            .map((item) => item?.platform ?? item)
            .filter((item) => !archived(item))
        : (value ?? []),
    z.array(z.object({ id, name: z.string(), url: z.string() })),
  ),
});
const publication = z.object({
  id,
  title: z.string().trim().min(1),
  description: z.string().nullish(),
  fileUrl: z.string(),
  publishedAt: instant,
});
export type PublicBroadcast = z.infer<typeof stream>;
export type PublicDocument = z.infer<typeof publication>;
export type LibraryFilters = {
  page: number;
  q: string;
  period: "upcoming" | "past";
};
export function parseBroadcast(value: unknown) {
  if (archived(value)) throw new Error("Broadcast unavailable");
  return stream.parse(value);
}
export function parseDocument(value: unknown, now = Date.now()) {
  if (archived(value)) throw new Error("Publication unavailable");
  const parsed = publication.parse(value);
  if (Date.parse(parsed.publishedAt) > now)
    throw new Error("Publication unavailable");
  return parsed;
}
export function libraryPage(
  kind: "streams" | "publications",
  response: unknown,
) {
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
    throw new Error("Library unavailable");
  return {
    data: parsed.data.map((value) =>
      kind === "streams" ? parseBroadcast(value) : parseDocument(value),
    ),
    total: parsed.meta.total,
    totalPages: Math.max(1, Math.ceil(parsed.meta.total / parsed.meta.limit)),
    checkedAt: Date.now(),
  };
}
export function readLibraryFilters(params: GroupSearchParams): LibraryFilters {
  return {
    ...readGroupFilters(params),
    period: params.period === "past" ? "past" : "upcoming",
  };
}
export function libraryHref(
  path: "/live" | "/publications",
  filters: LibraryFilters,
  updates: Partial<LibraryFilters> = {},
) {
  const next = { ...filters, ...updates };
  return getPaginationHref(path, next.page, {
    q: next.q,
    period: path === "/live" && next.period === "past" ? "past" : "",
  });
}
export function libraryReturnHref(
  path: "/live" | "/publications",
  value: unknown,
) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return path;
  try {
    const url = new URL(value, "https://church.invalid");
    if (url.origin !== "https://church.invalid" || url.pathname !== path)
      return path;
    const params: GroupSearchParams = {};
    for (const key of ["page", "q", "period"])
      if (url.searchParams.getAll(key).length === 1)
        params[key] = url.searchParams.get(key) ?? undefined;
    return libraryHref(path, readLibraryFilters(params));
  } catch {
    return path;
  }
}
export function isBroadcastLive(
  value: Pick<PublicBroadcast, "isLive" | "startsAt" | "endsAt">,
  now: number,
) {
  return (
    value.isLive &&
    (!value.startsAt || Date.parse(value.startsAt) <= now) &&
    (!value.endsAt || Date.parse(value.endsAt) > now)
  );
}
export function broadcastLabel(value: PublicBroadcast, now: number) {
  return isBroadcastLive(value, now)
    ? "Live now"
    : value.startsAt && Date.parse(value.startsAt) > now
      ? "Scheduled"
      : (value.endsAt && Date.parse(value.endsAt) <= now) ||
          (value.startsAt && Date.parse(value.startsAt) <= now)
        ? "Past broadcast"
        : "Not live";
}
export function broadcastLinks(value: PublicBroadcast) {
  return value.platforms.flatMap((platform) => {
    const href = getWebUrl(platform.url);
    return href && /^https?:\/\//.test(href)
      ? [{ ...platform, url: href }]
      : [];
  });
}
export function broadcastPlayer(value: PublicBroadcast) {
  for (const platform of broadcastLinks(value)) {
    const embed = getYouTubePreview(platform.url);
    if (embed) return { embed, url: platform.url, name: "YouTube" };
  }
  return null;
}
