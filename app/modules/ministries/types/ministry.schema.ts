import { z } from "zod";
import { groupEditorSchema } from "@/lib/utils/group-editor";
export const ministrySchema = groupEditorSchema("ministry");
export type MinistryFormValues = z.infer<typeof ministrySchema>;
