import { z } from "zod";
import { getProgramDateValue, isProgramDate } from "./program-records";
export type ProgramEditorKind = "program" | "template";
const recordId = z
  .string()
  .refine(
    (value) =>
      /^[1-9]\d*$/.test(value) &&
      value.length <= 19 &&
      BigInt(value) <= BigInt("9223372036854775807"),
    "Choose a valid record.",
  );
const optionalId = z.union([z.literal(""), recordId]).optional();
export function programClockKey(value: string) {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return undefined;
  if (+match[1] > 23 || +match[2] > 59 || +(match[3] || 0) > 59) return null;
  return match[1].padStart(2, "0") + ":" + match[2] + ":" + (match[3] || "00");
}
const fields = z.object({
  name: z.string().trim().max(191).optional(),
  date: z.string().optional(),
  location: z.string().trim().max(191).optional(),
  typeId: recordId,
  homecellId: optionalId,
  items: z.array(
    z.object({
      id: recordId.optional(),
      title: z.string().trim().min(1, "Activity title is required.").max(191),
      description: z
        .string()
        .refine(
          (value) => new TextEncoder().encode(value).byteLength <= 65535,
          "Shorten this description.",
        )
        .optional(),
      time: z.string().trim().max(191).optional(),
      responsibleId: optionalId,
    }),
  ),
});
export type ProgramEditorValues = z.infer<typeof fields>;
export function programEditorSchema(kind: ProgramEditorKind) {
  return fields.superRefine((values, context) => {
    if (kind === "template" && !values.name)
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "Template name is required.",
      });
    if (
      kind === "program" &&
      (!values.date ||
        !isProgramDate(values.date) ||
        +values.date.slice(0, 4) < 1000)
    )
      context.addIssue({
        code: "custom",
        path: ["date"],
        message: "Choose a valid program date.",
      });
    const times = new Set<string>();
    values.items.forEach((item, index) => {
      const key = programClockKey(item.time || "");
      if (key === null)
        context.addIssue({
          code: "custom",
          path: ["items", index, "time"],
          message: "Use a valid clock time, or a short timing instruction.",
        });
      else if (key && times.has(key))
        context.addIssue({
          code: "custom",
          path: ["items", index, "time"],
          message: "Another activity has this clock time.",
        });
      if (key) times.add(key);
    });
  });
}
export function programEditorDefaults(initial?: Partial<ProgramEditorValues>) {
  return {
    name: "",
    location: "",
    typeId: "",
    homecellId: "",
    ...initial,
    date: getProgramDateValue(initial?.date),
    items:
      initial?.items?.map((item) => ({
        ...item,
        description: item.description || "",
        time: item.time || "",
        responsibleId: item.responsibleId || "",
      })) || [],
  };
}
export function programEditorPayload(
  kind: ProgramEditorKind,
  values: ProgramEditorValues,
  changed?: {
    type?: boolean;
    homecell?: boolean;
    items?: boolean;
    date?: boolean;
  },
) {
  return {
    ...(kind === "program"
      ? {
          ...(changed === undefined || changed.date
            ? { date: values.date }
            : {}),
          location: values.location || "",
        }
      : { name: values.name }),
    ...(changed === undefined || changed.type ? { typeId: values.typeId } : {}),
    ...(changed === undefined || changed.homecell
      ? { homecellId: values.homecellId || "" }
      : {}),
    ...(changed === undefined || changed.items
      ? {
          items: values.items.map((item, index) => ({
            ...item,
            description: item.description || "",
            time: item.time || "",
            responsibleId: item.responsibleId || "",
            sequence: index + 1,
          })),
        }
      : {}),
  };
}
export function templateDraft(values: ProgramEditorValues, name: string) {
  return {
    ...values,
    name,
    items: values.items.map((item) => ({
      title: item.title,
      description: item.description,
      time: item.time,
      responsibleId: item.responsibleId,
    })),
  };
}
export function programEditorFailure(error: unknown, creating: boolean) {
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
    return "This record is no longer available. Review the list before trying again.";
  if (status === 400)
    return "Review required fields, activity times and selected profiles, type and homecell. A choice may no longer be available. Your entries are kept.";
  if (status === 409)
    return "The public address is already in use. Review the program date and location. Your entries are kept.";
  return creating
    ? "The save could not be confirmed. Check the list before retrying; the record may already have been created. Your entries are kept."
    : "The save could not be confirmed. Review the saved record before retrying. Your entries are kept.";
}
export function programFieldErrors(
  errors: unknown,
  prefix = "",
): { path: string; message: string }[] {
  if (!errors || typeof errors !== "object") return [];
  if ("message" in errors && typeof errors.message === "string")
    return [{ path: prefix.replace(/\.root$/, ""), message: errors.message }];
  return Object.entries(errors)
    .filter(([key]) => !["ref", "type", "types"].includes(key))
    .flatMap(([key, error]) =>
      programFieldErrors(error, prefix ? prefix + "." + key : key),
    );
}
