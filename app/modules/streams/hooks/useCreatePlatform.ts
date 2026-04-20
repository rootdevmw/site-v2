import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlatform } from "../api/createPlatform";

export function useCreatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlatform,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
    },
  });
}
