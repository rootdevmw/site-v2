import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishPublication, unpublishPublication } from "../api/publishPublication";

function usePublicationTransition(publish: boolean) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: publish ? publishPublication : unpublishPublication,
    onMutate: (id: string) => client.cancelQueries({ queryKey: ["publication", id] }),
    onSuccess: (result, id) => { client.setQueryData(["publication", id], result); },
    onSettled: (_data, _error, id) => Promise.all([
      client.invalidateQueries({ queryKey: ["publication", id] }),
      client.invalidateQueries({ queryKey: ["publications"] }),
    ]),
  });
}

export function usePublishPublication() { return usePublicationTransition(true); }
export function useUnpublishPublication() { return usePublicationTransition(false); }
