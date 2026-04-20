// hooks/usePublishNewsletter.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  publishNewsletter,
  unpublishNewsletter,
} from "../api/publishNewsletter";

export function usePublishNewsletter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishNewsletter,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter", id] });
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
    },
  });
}

export function useUnpublishNewsletter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unpublishNewsletter,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter", id] });
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
    },
  });
}
