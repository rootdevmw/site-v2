import { z } from "zod";

export const platformSchema = z.object({
  url: z.string().min(1, "URL is required"),
  name: z.string().min(1, "Name is required"),
});

export type PlatformFormValues = z.infer<typeof platformSchema>;
