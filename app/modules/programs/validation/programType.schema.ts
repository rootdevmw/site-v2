import { z } from "zod";

export const programTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type ProgramTypeFormValues = z.infer<typeof programTypeSchema>;
