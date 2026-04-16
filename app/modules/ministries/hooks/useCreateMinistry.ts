import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMinistry } from "../api/createMinistry";
import { showSuccess, showError } from "@/lib/toast";

export function useCreateMinistry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createMinistry,

    onSuccess: () => {
      showSuccess("Ministry created");
      qc.invalidateQueries({ queryKey: ["ministries"] });
    },

    onError: () => {
      showError("Failed to create ministry");
    },
  });
}
