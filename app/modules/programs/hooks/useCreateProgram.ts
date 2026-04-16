import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProgram } from "../api/createProgram";

export function useCreateProgram() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
    },
  });
}
