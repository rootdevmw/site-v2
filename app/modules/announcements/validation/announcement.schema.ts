import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  priority: z.number().min(1).max(10).default(5),
  expiryDate: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return null;
    }
    return value;
  }, z.string().nullable()),
  targets: z
    .array(
      z.object({
        targetType: z.enum(["MINISTRY", "HOMECELL", "ROLE"]),
        targetId: z.string().min(1, "Target ID is required"),
      }),
    )
    .default([]),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
