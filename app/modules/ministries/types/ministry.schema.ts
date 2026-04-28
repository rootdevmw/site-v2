import { z } from "zod";

export const ministrySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  leaderId: z.string().min(1, "Leader is required"),
  overseerId: z.string().optional(),
  purpose: z.string().min(1, "Purpose is required"),
});

export type MinistryFormValues = z.infer<typeof ministrySchema>;
