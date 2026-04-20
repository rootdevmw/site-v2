import { z } from "zod";

export const streamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  isLive: z.preprocess((value) => {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    return value;
  }, z.boolean().default(false)),
  startsAt: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return null;
    }
    if (typeof value === "string") {
      return new Date(value);
    }
    return value;
  }, z.date().nullable()),
  platformIds: z
    .array(z.string().min(1, "Platform ID is required"))
    .default([]),
});

export type StreamFormValues = z.infer<typeof streamSchema>;
