"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePublicationEditor } from "@/lib/api/publication-editor";
import type { PublicationEditorPayload } from "@/lib/utils/publication-editor";

export function useSavePublicationEditor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id?: string;
      data: PublicationEditorPayload;
    }) => savePublicationEditor(data, id),
    retry: false,
    onSettled: () =>
      Promise.all(
        [
          "publications",
          "publication",
          "audit-logs",
          "audit-timeline",
          "dashboard-overview",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      ),
  });
}
