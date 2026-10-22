import { z } from "zod";
import { getPaginationHref } from "@/lib/utils/pagination";

const id = z
  .union([z.string().min(1), z.number().int().nonnegative()])
  .transform(String);
const named = z.object({ id, name: z.string() });
export const publicMessageSchema = z.object({
  id,
  title: z.string().trim().min(1),
  slug: z
    .string()
    .min(1)
    .refine(
      (value) =>
        value !== "." && value !== ".." && !/[\u0000-\u001f\u007f]/.test(value),
    ),
  body: z.string(),
  status: z.literal("Published"),
  createdAt: z.string(),
  publishedAt: z.string().nullish(),
  type: named.nullish(),
  author: z
    .object({ id, firstName: z.string(), lastName: z.string() })
    .nullish(),
  tags: z
    .array(z.object({ tag: named }))
    .nullish()
    .transform((tags) => tags ?? []),
  scriptures: z
    .array(
      z.object({
        id: id.optional(),
        book: z.string(),
        chapter: z.number(),
        verseFrom: z.number(),
        verseTo: z.number().nullish(),
        version: z.string().nullish(),
      }),
    )
    .nullish()
    .transform((references) => references ?? []),
});
export type PublicMessage = z.infer<typeof publicMessageSchema>;
export type MessageFilters = {
  page: number;
  q: string;
  typeId: string;
  tags: string;
};
export type MessageSearchParams = Record<string, string | string[] | undefined>;
export const MESSAGE_PAGE_SIZE = 6;

export function readMessageFilters(
  params: MessageSearchParams,
): MessageFilters {
  const single = (name: string, maximum: number) =>
    typeof params[name] === "string"
      ? params[name].trim().slice(0, maximum)
      : "";
  const page = single("page", 30),
    typeId = single("typeId", 30);
  return {
    page:
      /^[1-9]\d*$/.test(page) &&
      Number.isSafeInteger(Number(page)) &&
      Number(page) <= 1000000
        ? Number(page)
        : 1,
    typeId:
      /^[1-9]\d{0,18}$/.test(typeId) &&
      BigInt(typeId) <= BigInt("9223372036854775807")
        ? typeId
        : "",
    q: single("q", 200),
    tags: single("tags", 191),
  };
}
export function messagesHref(
  filters: MessageFilters,
  updates: Partial<MessageFilters> = {},
) {
  const next = { ...filters, ...updates };
  return getPaginationHref("/content", next.page, {
    q: next.q,
    typeId: next.typeId,
    tags: next.tags,
  });
}
export function messageHref(slug: string, from?: string) {
  return (
    "/content/" +
    encodeURIComponent(slug) +
    (from && from !== "/content" ? "?" + new URLSearchParams({ from }) : "")
  );
}
export function messagesReturnHref(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return "/content";
  try {
    const url = new URL(value, "https://church.invalid");
    if (url.origin !== "https://church.invalid" || url.pathname !== "/content")
      return "/content";
    const params: MessageSearchParams = {};
    for (const key of ["page", "q", "typeId", "tags"])
      if (url.searchParams.getAll(key).length === 1)
        params[key] = url.searchParams.get(key) ?? undefined;
    return messagesHref(readMessageFilters(params));
  } catch {
    return "/content";
  }
}
export function messagePage(response: unknown) {
  const parsed = z
    .object({
      success: z.boolean().optional(),
      data: z.array(publicMessageSchema),
      meta: z.object({
        total: z.number().int().nonnegative(),
        limit: z.number().int().positive().max(50),
      }),
    })
    .parse(response);
  if (parsed.success === false || parsed.meta.total < parsed.data.length)
    throw new Error("Message list unavailable");
  return {
    data: parsed.data,
    total: parsed.meta.total,
    totalPages: Math.max(1, Math.ceil(parsed.meta.total / parsed.meta.limit)),
  };
}
export function messageTypes(response: unknown) {
  const parsed = z
    .object({ success: z.boolean().optional(), data: z.array(named) })
    .parse(response);
  if (parsed.success === false) throw new Error("Message types unavailable");
  return [...new Map(parsed.data.map((type) => [type.id, type])).values()];
}
export function messageAttribution(message: PublicMessage) {
  return message.author
    ? [message.author.firstName, message.author.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ")
    : "";
}
export function messageTags(message: PublicMessage) {
  return [
    ...new Set(message.tags.map(({ tag }) => tag.name.trim()).filter(Boolean)),
  ];
}
export function publicScriptureReference(reference: {
  book: string;
  chapter: number;
  verseFrom: number;
  verseTo?: number | null;
  version?: string | null;
}) {
  const book = reference.book
    .trim()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  if (
    !book ||
    !Number.isInteger(reference.chapter) ||
    reference.chapter < 1 ||
    !Number.isInteger(reference.verseFrom) ||
    reference.verseFrom < 1
  )
    return null;
  const end =
    reference.verseTo &&
    Number.isInteger(reference.verseTo) &&
    reference.verseTo > reference.verseFrom
      ? "–" + reference.verseTo
      : "";
  const query =
    book + " " + reference.chapter + ":" + reference.verseFrom + end;
  return {
    query: query.replace("–", "-"),
    label:
      query +
      (reference.version?.trim() ? " (" + reference.version.trim() + ")" : ""),
  };
}
export function messagePassages(message: PublicMessage) {
  return message.scriptures.flatMap((reference) => {
    const result = publicScriptureReference(reference);
    return result ? [result] : [];
  });
}
export function messageScriptures(message: PublicMessage) {
  return [
    ...new Set(messagePassages(message).map((reference) => reference.label)),
  ];
}
export function messageDate(message: PublicMessage) {
  return (
    [message.publishedAt, message.createdAt].find(
      (candidate): candidate is string =>
        typeof candidate === "string" &&
        Number.isFinite(new Date(candidate).getTime()),
    ) ?? null
  );
}
