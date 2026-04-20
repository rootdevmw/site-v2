import { z } from "zod";

export const newsletterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  publishedAt: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return null;
    }
    if (typeof value === "string") {
      return new Date(value);
    }
    return value;
  }, z.date().nullable()),
  file: z.instanceof(File).optional(),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
