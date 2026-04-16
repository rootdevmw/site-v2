import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { showSuccess, showError } from "@/lib/toast";
import { MinistryFormValues } from "../types/ministry.schema";

type UpdateMinistryVariables = {
  id: string;
  data: MinistryFormValues;
};

export function useUpdateMinistry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateMinistryVariables) =>
      api.patch(`/ministries/${id}`, data),

    onSuccess: (_res, variables) => {
      showSuccess("Ministry updated");
      qc.invalidateQueries({ queryKey: ["ministries"] });
      qc.invalidateQueries({ queryKey: ["ministry", variables.id] });
    },

    onError: () => {
      showError("Failed to update ministry");
    },
  });
}
