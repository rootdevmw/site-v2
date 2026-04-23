import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlatform } from "../api/updatePlatform";
import { PlatformFormValues } from "../validation/platform.schema";

export function useUpdatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlatformFormValues }) =>
      updatePlatform(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
      queryClient.invalidateQueries({ queryKey: ["platform", variables.id] });
    },
  });
}
