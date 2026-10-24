import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishContent } from "../api/publishContent";
import type { Content } from "../types/content.types";

export function usePublishContent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Published" | "Draft" }) => publishContent(id, status),
    onMutate: () => client.cancelQueries({ queryKey: ["content"] }),
    onSuccess: (result, { id }) => {
      // Publishing returns a scalar record, without the author/type/tag relations.
      client.setQueryData<{ data: Content }>(["content", id], (previous) => previous ? { ...previous, data: { ...previous.data, status: result.data.status } } : undefined);
    },
    // A timed-out write may still have succeeded. Always re-read the server state.
    onSettled: () => client.invalidateQueries({ queryKey: ["content"] }),
  });
}
