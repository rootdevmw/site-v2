import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProgramFromTemplate } from "../api/createProgramFromTemplate";

export function useCreateProgramFromTemplate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createProgramFromTemplate,
    retry: false,
    onMutate: () => client.cancelQueries({ queryKey: ["programs"] }),
    onSuccess: (result) => { client.setQueryData(["program", result.data.id], result); },
    // A lost response may still have created a record; refresh the list on either outcome.
    onSettled: () => client.invalidateQueries({ queryKey: ["programs"] }),
  });
}
