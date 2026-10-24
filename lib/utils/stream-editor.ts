import { z } from "zod";
import type {
  Stream,
  Platform,
} from "@/app/modules/streams/types/stream.types";
import { eventTimeInput, eventTimeToISO } from "./event-editor";
import { getWebUrl } from "./editorial-records";

export const streamRecordId = z
  .string()
  .refine(
    (value) =>
      /^[1-9]\d*$/.test(value) &&
      value.length <= 19 &&
      BigInt(value) <= BigInt("9223372036854775807"),
    "Choose a valid record.",
  );
export function streamPlatformUrl(value: string) {
  if (
    value.includes("\\") ||
    Array.from(value).some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
    )
  )
    return null;
  const href = getWebUrl(value);
  return href && /^https?:\/\//i.test(href) && href.length <= 191 ? href : null;
}
export const streamPlatformSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Platform name is required.")
    .max(191, "Use at most 191 characters."),
  url: z
    .string()
    .trim()
    .refine(
      (value) => !!streamPlatformUrl(value),
      "Enter a full http or https web address of at most 191 characters, without credentials.",
    ),
});
export type StreamPlatformValues = z.infer<typeof streamPlatformSchema>;
export const streamEditorSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(191, "Use at most 191 characters."),
    isLive: z.boolean(),
    startsAt: z
      .string()
      .refine(
        (value) => !value || !!eventTimeToISO(value),
        "Enter a valid start date and time.",
      ),
    endsAt: z
      .string()
      .refine(
        (value) => !value || !!eventTimeToISO(value),
        "Enter a valid end date and time.",
      ),
    platformIds: z.array(streamRecordId),
  })
  .superRefine((value, context) => {
    const start = eventTimeToISO(value.startsAt),
      end = eventTimeToISO(value.endsAt);
    if (value.endsAt && !value.startsAt)
      context.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Add a start time before setting an end time.",
      });
    if (start && end && end <= start)
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End time must be after start time.",
      });
    if (value.isLive && !value.startsAt)
      context.addIssue({
        code: "custom",
        path: ["startsAt"],
        message:
          "Set a start time before selecting this stream for Watch online.",
      });
    if (value.isLive && !value.platformIds.length)
      context.addIssue({
        code: "custom",
        path: ["platformIds"],
        message: "Connect a platform before selecting the live broadcast.",
      });
  });
export type StreamEditorValues = z.infer<typeof streamEditorSchema>;
export type StreamEditorPayload = Partial<
  Omit<StreamEditorValues, "startsAt" | "endsAt">
> & { startsAt?: string | null; endsAt?: string | null };
export function streamEditorDefaults(
  initial?: Partial<Stream>,
): StreamEditorValues {
  return {
    title: initial?.title ?? "",
    isLive: initial?.isLive ?? false,
    startsAt: eventTimeInput(initial?.startsAt),
    endsAt: eventTimeInput(initial?.endsAt),
    platformIds: [
      ...new Set(initial?.platforms?.map((platform) => platform.id) ?? []),
    ],
  };
}
export function streamEditorPayload(
  values: StreamEditorValues,
  dirty?: Partial<Record<keyof StreamEditorValues, boolean>>,
): StreamEditorPayload {
  if (
    (values.startsAt && !eventTimeToISO(values.startsAt)) ||
    (values.endsAt && !eventTimeToISO(values.endsAt))
  )
    throw new Error("Review the stream schedule.");
  return {
    ...((!dirty || dirty.title) && { title: values.title.trim() }),
    ...((!dirty || dirty.isLive) && { isLive: values.isLive }),
    ...((!dirty || dirty.startsAt) && {
      startsAt: values.startsAt ? eventTimeToISO(values.startsAt) : null,
    }),
    ...((!dirty || dirty.endsAt) && {
      endsAt: values.endsAt ? eventTimeToISO(values.endsAt) : null,
    }),
    ...((!dirty || dirty.platformIds) && {
      platformIds: [...new Set(values.platformIds)],
    }),
  };
}
export function streamLiveSelectionIssue(
  stream: Pick<Stream, "startsAt" | "endsAt" | "platforms">,
  now = Date.now(),
) {
  if (!stream.startsAt || !Number.isFinite(Date.parse(stream.startsAt)))
    return "Add a start time in Edit stream before selecting this broadcast.";
  if (stream.endsAt && Date.parse(stream.endsAt) <= now)
    return "Update the end time in Edit stream before selecting this broadcast.";
  if (!stream.platforms.some((platform) => streamPlatformUrl(platform.url)))
    return "Add an available platform watch link before selecting this broadcast.";
  return "";
}
export function streamPlatformPage(
  platforms: Platform[],
  search: string,
  page: number,
) {
  const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = platforms.filter((platform) =>
    terms.every((term) =>
      (platform.name + " " + platform.url).toLocaleLowerCase().includes(term),
    ),
  );
  const pages = Math.max(1, Math.ceil(matches.length / 10)),
    current = Math.max(1, Math.min(page, pages));
  return {
    data: matches.slice((current - 1) * 10, current * 10),
    page: current,
    pages,
    total: matches.length,
  };
}
export function streamEditorFailure(
  error: unknown,
  creating: boolean,
  platform = false,
) {
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
    return "Your account no longer has permission to save this record.";
  if (status === 404)
    return "This stream or shared platform is no longer available. Review the refreshed records.";
  if (status === 400)
    return platform
      ? "Review the platform name and full web address. Your entries are kept."
      : "Review the title, schedule and active platform selections. Live selection needs a start time, an available link and an end time that has not passed. Your entries are kept.";
  if (status === 409)
    return platform
      ? "That platform name is already in use. Refresh the platforms and choose the existing record, or use another name."
      : "The stream address is already in use, or another change overlapped this save. Review the saved streams before retrying.";
  return platform
    ? "The platform save could not be confirmed. Refresh the platform list before retrying; the shared change may already have saved. Your entries are kept."
    : creating
      ? "The save could not be confirmed. Review the streams list before retrying; this stream may already have been created. Your entries are kept."
      : "The save could not be confirmed. Review the saved stream and live selection before retrying. Your entries are kept.";
}
