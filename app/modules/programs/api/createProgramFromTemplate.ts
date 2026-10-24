import { api } from "@/lib/api/client";
import type { Program } from "../types/program.types";
import { getTemplateCreationInput } from "@/lib/utils/program-records";

export async function createProgramFromTemplate(input: { templateId: string; date: string }): Promise<{ data: Program }> {
  const payload = getTemplateCreationInput(input.templateId, input.date);
  const response = await api.post("/programs/from-template", payload, { timeout: 30000, silent: true });
  if (!response.data?.data?.id) throw new Error("The program creation response could not be confirmed.");
  return response.data;
}
