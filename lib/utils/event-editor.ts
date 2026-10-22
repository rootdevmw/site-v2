import { z } from "zod";

const id = z.string().refine((value) => /^[1-9]\d*$/.test(value) && value.length <= 19 && BigInt(value) <= BigInt("9223372036854775807"), "Choose a valid record.");
// datetime-local is a wall clock, never the browser's local timezone.
export function eventTimeToISO(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(\.\d{1,3})?)?$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = "00", fraction = ""] = match;
  if (+year < 1000 || +month < 1 || +month > 12 || +day < 1 || +day > 31 || +hour > 23 || +minute > 59 || +second > 59) return null;
  const wall = `${year}-${month}-${day}T${hour}:${minute}:${second}${fraction.padEnd(fraction ? 4 : 0, "0")}Z`;
  const date = new Date(wall);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 19) !== wall.slice(0, 19)) return null;
  const iso = new Date(date.getTime() - 2 * 60 * 60 * 1000).toISOString();
  return +iso.slice(0, 4) >= 1000 ? iso : null;
}
export function eventTimeInput(value?: string | null) {
  if (!value || !/(Z|[+-]\d{2}:\d{2})$/i.test(value)) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/Z$/, "").replace(/\.000$/, "");
}
export const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(191, "Use at most 191 characters."),
  location: z.string().trim().max(191, "Use at most 191 characters.").optional(),
  description: z.string().refine((value) => new TextEncoder().encode(value).byteLength <= 65535, "Shorten the description before saving.").optional(),
  typeId: id,
  ministryIds: z.array(id),
  startTime: z.string().refine((value) => !!eventTimeToISO(value), "Enter a valid start date and time."),
  endTime: z.string().refine((value) => !!eventTimeToISO(value), "Enter a valid end date and time."),
}).superRefine((value, context) => {
  const start = eventTimeToISO(value.startTime), end = eventTimeToISO(value.endTime);
  if (start && end && end <= start) context.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after the start time." });
});
export type EventEditorValues = z.infer<typeof eventSchema>;
export type EventEditorPayload = Partial<Omit<EventEditorValues, "startTime" | "endTime">> & { startTime?: string; endTime?: string };
export function eventEditorDefaults(initial?: Partial<EventEditorValues>) {
  return { title: "", location: "", description: "", typeId: "", ministryIds: [], startTime: "", endTime: "", ...initial };
}
export function eventEditorPayload(values: EventEditorValues, changed: { ministries: boolean; type: boolean; start: boolean; end: boolean }): EventEditorPayload {
  const startTime = eventTimeToISO(values.startTime), endTime = eventTimeToISO(values.endTime);
  if (!startTime || !endTime) throw new Error("Review the event schedule.");
  return { title: values.title, location: values.location || "", description: values.description || "", ...(changed.type && { typeId: values.typeId }), ...(changed.ministries && { ministryIds: [...new Set(values.ministryIds)] }), ...(changed.start && { startTime }), ...(changed.end && { endTime }) };
}
export function eventEditorFailure(error: unknown, creating: boolean, type = false) {
  const response = error && typeof error === "object" && "response" in error ? error.response : null;
  const status = response && typeof response === "object" && "status" in response ? response.status : null;
  if (status === 401) return "Your session may have expired. Sign in again before saving.";
  if (status === 403) return "Your account no longer has permission to make this change.";
  if (status === 404) return "This event is no longer available. Review the events list.";
  if (status === 400) return type ? "Enter a type name from 1 to 191 characters." : "Review the schedule and selected type and ministries. A choice may no longer be available. Your entries are kept.";
  if (status === 409) return type ? "This type name is already in use. Reload the types and choose it, or use another name." : "The public address is already in use. Try another event title. Your entries are kept.";
  return type ? "Creation could not be confirmed. Reload the types before retrying; the type may already exist." : creating ? "The save could not be confirmed. Check the events list before retrying; the event may already have been created. Your entries are kept." : "The save could not be confirmed. Review the saved event before retrying. Your entries are kept.";
}
