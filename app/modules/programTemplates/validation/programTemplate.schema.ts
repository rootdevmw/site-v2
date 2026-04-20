import { z } from "zod";

export const programTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  typeId: z.string().min(1, "Program type is required"),
  homecellId: z.string().optional(),
  items: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      time: z.string().optional(),
      description: z.string().optional(),
      responsibleId: z.string().optional(),
    }),
  ),
});

export type ProgramTemplateFormValues = z.infer<typeof programTemplateSchema>;
