"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteDirectoryRecord, getDirectoryPage, getHomecellDirectory } from "@/lib/api/directory-records";
import { paginateHomecells, type DirectoryFilters, type DirectoryKind } from "@/lib/utils/directory-records";
import { retryRecordRequest } from "@/lib/utils/record-details";

export function useDirectoryRecords(kind: DirectoryKind, filters: DirectoryFilters, enabled: boolean) {
  return useQuery({
    queryKey: [kind, "directory", ...(kind === "homecells" ? [] : [filters])],
    queryFn: async ({ signal }) => kind === "homecells" ? { collection: await getHomecellDirectory(signal) } : await getDirectoryPage(kind, filters, signal),
    select: (result) => "collection" in result ? paginateHomecells(result.collection, filters) : result,
    enabled, staleTime: 30000, retry: retryRecordRequest,
  });
}

export function useDeleteDirectoryRecord(kind: DirectoryKind) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDirectoryRecord(kind, id),
    retry: false,
    onSettled: async () => {
      // Deletion can affect leadership, membership, schedules and history.
      // Refresh after either outcome: a lost response may have committed.
      await Promise.all(["members", "member", "ministries", "ministry", "ministry-members", "homecells", "homecell", "homecell-members", "programs", "program", "program-templates", "program-template", "users", "user", "audit-timeline", "audit-logs"].map((key) => client.invalidateQueries({ queryKey: [key] })));
    },
  });
}
