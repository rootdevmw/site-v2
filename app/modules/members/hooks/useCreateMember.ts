import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMember } from "../api/createMember";
import { showError, showSuccess } from "@/lib/toast";

export function useCreateMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      showSuccess("Member created successfully");
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => {
      showError("Failed to create member");
    },
  });
}
