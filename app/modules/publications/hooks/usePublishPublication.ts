import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  publishPublication,
  unpublishPublication,
} from "../api/publishPublication";

export function usePublishPublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishPublication,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["publication", id] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}

export function useUnpublishPublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unpublishPublication,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["publication", id] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}
