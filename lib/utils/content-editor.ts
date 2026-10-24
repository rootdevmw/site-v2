import { z } from "zod";
import type { Content } from "@/app/modules/content/types/content.types";
const id = z
  .string()
  .refine(
    (value) =>
      /^[1-9]\d*$/.test(value) &&
      value.length <= 19 &&
      BigInt(value) <= BigInt("9223372036854775807"),
    "Choose a valid record.",
  );
export function hasMessageBody(html: string) {
  const visible = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  return (
    !!visible
      .replace(/<[^>]*>/g, "")
      .replace(/&(?:nbsp|#160|#x0*a0);|[\s\u200B-\u200D\uFEFF]/gi, "")
      .trim() ||
    /<(?:img|audio|video|iframe)\b[^>]*\bsrc\s*=|<span\b[^>]*data-scripture/i.test(
      visible,
    )
  );
}
export const contentScriptureSchema = z
  .object({
    id: id.optional(),
    book: z.string().trim().min(1, "Book is required.").max(191),
    chapter: z.number().int().min(1).max(2147483647),
    verseFrom: z.number().int().min(1).max(2147483647),
    verseTo: z.number().int().min(1).max(2147483647).optional(),
    version: z.string().trim().max(191).optional(),
  })
  .superRefine((value, context) => {
    if (value.verseTo !== undefined && value.verseTo < value.verseFrom)
      context.addIssue({
        code: "custom",
        path: ["verseTo"],
        message: "The last verse must be at or after the first verse.",
      });
  });
export const contentEditorSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(191),
  body: z
    .string()
    .refine(
      hasMessageBody,
      "Add message text, a scripture reference or media.",
    ),
  typeId: id,
  authorId: z.union([z.literal(""), id]).optional(),
  tags: z.array(z.string().trim().min(1).max(191)),
  scriptures: z.array(contentScriptureSchema),
});
export type ContentEditorValues = z.infer<typeof contentEditorSchema>;
export function contentEditorDefaults(initial?: Partial<ContentEditorValues>) {
  return {
    title: "",
    body: "",
    typeId: "",
    authorId: "",
    tags: [],
    scriptures: [],
    ...initial,
  };
}
export function contentEditorValues(content: Content) {
  return {
    id: content.id,
    title: content.title,
    body: content.body,
    typeId: content.typeId || content.type?.id || "",
    authorId: content.authorId || content.author?.id || "",
    tags: content.tags?.map((entry) => entry.tag.name) || [],
    scriptures:
      content.scriptures?.map((entry) => ({
        id: entry.id,
        book: entry.book,
        chapter: entry.chapter,
        verseFrom: entry.verseFrom,
        verseTo: entry.verseTo ?? undefined,
        version: entry.version || "",
      })) || [],
  };
}
export function addContentTag(tags: string[], input: string) {
  const name = input.trim();
  if (!name || name.length > 191)
    return { tags, error: "Enter a tag from 1 to 191 characters." };
  if (tags.some((tag) => tag.toLocaleLowerCase() === name.toLocaleLowerCase()))
    return { tags, error: "This tag is already added." };
  return { tags: [...tags, name], error: "" };
}
export function contentEditorPayload(
  values: ContentEditorValues,
  changed?: {
    body?: boolean;
    type?: boolean;
    author?: boolean;
    tags?: boolean;
    scriptures?: boolean;
  },
) {
  return {
    title: values.title,
    ...(changed === undefined || changed.body ? { body: values.body } : {}),
    ...(changed === undefined || changed.type ? { typeId: values.typeId } : {}),
    ...(changed === undefined || changed.author
      ? { authorId: values.authorId || "" }
      : {}),
    ...(changed === undefined || changed.tags
      ? {
          tags: [
            ...new Map(
              values.tags.map((tag) => [
                tag.trim().toLocaleLowerCase(),
                tag.trim(),
              ]),
            ).values(),
          ],
        }
      : {}),
    ...(changed === undefined || changed.scriptures
      ? {
          scriptures: values.scriptures.map((entry) => ({
            ...entry,
            verseTo: entry.verseTo ?? null,
            version: entry.version || "",
          })),
        }
      : {}),
  };
}
export function contentEditorFailure(error: unknown, creating: boolean) {
  const response =
    error && typeof error === "object" && "response" in error
      ? error.response
      : null;
  const status =
    response && typeof response === "object" && "status" in response
      ? response.status
      : null;
  if (status === 401)
    return "Your session may have expired. Sign in again before saving.";
  if (status === 403)
    return "Your account no longer has permission to save this message.";
  if (status === 404)
    return "This message is no longer available. Review the content list.";
  if (status === 400)
    return "Review required fields, scripture ranges and selected type or author. A selected record or media file may no longer be available. Your entries are kept.";
  if (status === 409)
    return "The public address is already in use. Try another message title. Your entries are kept.";
  if (status === 413)
    return "This message is too large for the server. Shorten it or reduce its references before saving. Your entries are kept.";
  return creating
    ? "The save could not be confirmed. Check the content list before retrying; the draft may already have been created. Your entries are kept."
    : "The save could not be confirmed. Review the saved message before retrying. Your entries are kept.";
}
