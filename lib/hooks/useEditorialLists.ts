"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteEditorialRecord, getEditorialList, getEditorialOptions } from "@/lib/api/editorial-lists";
import { retryRecordRequest } from "@/lib/utils/record-details";
import type { EditorialFilters, EditorialKind } from "@/lib/utils/editorial-lists";

export function useEditorialList(kind: EditorialKind, filters: EditorialFilters, enabled: boolean) {
  return useQuery({ queryKey: [kind, "management-list", filters], queryFn: ({ signal }) => getEditorialList(kind, filters, signal), enabled, staleTime: 30000, retry: retryRecordRequest });
}

export function useEditorialOptions(kind: EditorialKind, enabled: boolean) {
  const family = kind === "streams" ? "streams" : "content";
  return useQuery({ queryKey: [family === "streams" ? "platforms" : "content-types", "management-options"], queryFn: ({ signal }) => getEditorialOptions(family, signal), enabled: enabled && kind !== "publications", staleTime: 30000, retry: retryRecordRequest });
}

export function useDeleteEditorialRecord(kind: EditorialKind) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEditorialRecord(kind, id), retry: false,
    onSettled: () => Promise.all(["content", "publications", "publication", "streams", "stream", "audit-timeline", "audit-logs"].map((key) => client.invalidateQueries({ queryKey: [key] }))),
  });
}
