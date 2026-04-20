import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNewsletter } from "../api/updateNewsletter";
import { NewsletterFormValues } from "../types/newsletter.types";

export function useUpdateNewsletter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NewsletterFormValues }) =>
      updateNewsletter(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      queryClient.invalidateQueries({ queryKey: ["newsletter", variables.id] });
    },
  });
}
