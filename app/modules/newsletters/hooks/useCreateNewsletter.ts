import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewsletter } from "../api/createNewsletter";
import { NewsletterFormValues } from "../types/newsletter.types";

export function useCreateNewsletter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewsletterFormValues) => createNewsletter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
    },
  });
}
