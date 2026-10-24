import { z } from "zod";
import type { Publication } from "@/app/modules/publications/types/publication.types";
import { eventTimeInput, eventTimeToISO } from "./event-editor";

export const PUBLICATION_FILE_LIMIT = 50 * 1024 * 1024;
export function publicationFileIssue(file: File) {
  if (!file.size) return "Choose a PDF that is not empty.";
  if (file.size > PUBLICATION_FILE_LIMIT)
    return "Choose a PDF of 50 MB or less.";
  if (
    !/\.pdf$/i.test(file.name) ||
    !["", "application/pdf", "application/octet-stream"].includes(
      file.type.toLowerCase(),
    )
  )
    return "Choose a PDF document (.pdf).";
  return "";
}
export async function validatePublicationFile(file: File) {
  const issue = publicationFileIssue(file);
  if (issue) return issue;
  try {
    return (await file.slice(0, 5).text()) === "%PDF-"
      ? ""
      : "This file does not have a PDF header. Choose a valid PDF.";
  } catch {
    return "This file could not be read. Choose it again before saving.";
  }
}
export const publicationEditorSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(191, "Use at most 191 characters."),
    description: z
      .string()
      .refine(
        (value) => new TextEncoder().encode(value).byteLength <= 65535,
        "Shorten the description before saving.",
      ),
    visibility: z.enum(["Draft", "Published"]),
    publishedAt: z.string(),
    file: z
      .custom<File>(
        (value) => typeof File !== "undefined" && value instanceof File,
        "Choose a document from your device.",
      )
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.visibility === "Published" && !eventTimeToISO(value.publishedAt))
      context.addIssue({
        code: "custom",
        path: ["publishedAt"],
        message: "Enter a valid publication date and time in Malawi time.",
      });
    if (value.file) {
      const issue = publicationFileIssue(value.file);
      if (issue)
        context.addIssue({ code: "custom", path: ["file"], message: issue });
    }
  });
export type PublicationEditorValues = z.infer<typeof publicationEditorSchema>;
export type PublicationEditorPayload = {
  title?: string;
  description?: string;
  publishedAt?: string | null;
  file?: File;
};
export function publicationEditorDefaults(
  initial?: Partial<Publication>,
): PublicationEditorValues {
  return {
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    visibility: initial?.publishedAt ? "Published" : "Draft",
    publishedAt: eventTimeInput(initial?.publishedAt),
    file: undefined,
  };
}
export function publicationEditorPayload(
  values: PublicationEditorValues,
  dirty?: Partial<Record<keyof PublicationEditorValues, boolean>>,
): PublicationEditorPayload {
  const date =
    values.visibility === "Draft" ? null : eventTimeToISO(values.publishedAt);
  if (values.visibility === "Published" && !date)
    throw new Error("Review the publication date.");
  return {
    ...((!dirty || dirty.title) && { title: values.title.trim() }),
    ...((!dirty || dirty.description) && { description: values.description }),
    ...((!dirty ||
      dirty.visibility ||
      (dirty.publishedAt && values.visibility === "Published")) && {
      publishedAt: date,
    }),
    ...(values.file && { file: values.file }),
  };
}
export function publicationEditorFailure(error: unknown, creating: boolean) {
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
    return "Your account no longer has permission to save this publication.";
  if (status === 404)
    return "This publication is no longer available. Review the publications list.";
  if (status === 413)
    return "The document is too large. Choose a PDF of 50 MB or less. Your entries are kept.";
  if (status === 400)
    return "Review the title, publication date and PDF document. Publishing requires a usable attachment. Your entries are kept.";
  return creating
    ? "The save could not be confirmed. Check the publications list before retrying; the publication may already have been created. Your entries and selected document are kept."
    : "The save could not be confirmed. Review the saved publication before retrying. Your entries and selected document are kept.";
}
