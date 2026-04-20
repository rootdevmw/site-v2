import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  typeId: z.string().min(1, "Event type is required"),
  ministryIds: z.array(z.string()).optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

export type EventFormValues = z.infer<typeof eventSchema>;
