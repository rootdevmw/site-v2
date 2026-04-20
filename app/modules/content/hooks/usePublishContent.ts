import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishContent } from "../api/publishContent";

export function usePublishContent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "Published" | "Draft";
    }) => publishContent(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["content"] });
      qc.invalidateQueries({ queryKey: ["content", id] });
    },
  });
}
