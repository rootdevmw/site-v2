import { programEditorSchema } from "@/lib/utils/program-editor";
export const programTemplateSchema = programEditorSchema("template");
export type { ProgramEditorValues as ProgramTemplateFormValues } from "@/lib/utils/program-editor";
