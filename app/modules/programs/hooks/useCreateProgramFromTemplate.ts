import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useCreateProgramFromTemplate() {
  return useMutation({
    mutationFn: (data: { templateId: string; date: string }) =>
      api.post("/programs/from-template", data),
  });
}
