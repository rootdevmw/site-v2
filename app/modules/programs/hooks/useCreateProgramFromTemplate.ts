import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

type ItemOverride = {
  sequence: number;
  responsibleId: string;
};

export function useCreateProgramFromTemplate() {
  return useMutation({
    mutationFn: (data: {
      templateId: string;
      date: string;
      items?: ItemOverride[];
    }) => api.post("/programs/from-template", data),
  });
}
