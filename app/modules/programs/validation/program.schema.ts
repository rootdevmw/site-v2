import { z } from "zod";

export const programSchema = z.object({
  date: z.string().min(1, "Date is required"),
  location: z.string().optional(),
  typeId: z.string().min(1, "Program type is required"),
  homecellId: z.string().optional(),
  items: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      time: z.string().optional(),
      location: z.string().optional(),
      responsibleId: z.string().optional(),
    }),
  ),
});

export type ProgramFormValues = z.infer<typeof programSchema>;
