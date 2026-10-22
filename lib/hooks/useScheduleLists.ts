"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteScheduleRecord, getScheduleList, getScheduleTypes } from "@/lib/api/schedule-lists";
import { getHomecellDirectory } from "@/lib/api/directory-records";
import { retryRecordRequest } from "@/lib/utils/record-details";
import { scheduleFilterError, type ScheduleFilters, type ScheduleKind } from "@/lib/utils/schedule-lists";

export function useScheduleList(kind: ScheduleKind, filters: ScheduleFilters, enabled: boolean) {
  return useQuery({
    queryKey: [kind, "management-list", filters],
    queryFn: ({ signal }) => getScheduleList(kind, filters, signal),
    enabled: enabled && !scheduleFilterError(filters), staleTime: 30000, retry: retryRecordRequest,
  });
}

export function useScheduleTypes(kind: ScheduleKind, enabled: boolean) {
  const family = kind === "events" ? "events" : "programs";
  return useQuery({ queryKey: [family === "events" ? "eventTypes" : "program-types", "management-options"], queryFn: ({ signal }) => getScheduleTypes(family, signal), enabled, staleTime: 30000, retry: retryRecordRequest });
}

export function useScheduleHomecells(enabled: boolean) {
  // Share the collection shape/key used by the homecell management directory.
  return useQuery({
    queryKey: ["homecells", "directory"],
    queryFn: async ({ signal }) => ({ collection: await getHomecellDirectory(signal) }),
    select: (result) => result.collection.map(({ id, name }) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    enabled, staleTime: 30000, retry: retryRecordRequest,
  });
}

export function useDeleteScheduleRecord(kind: ScheduleKind) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteScheduleRecord(kind, id), retry: false,
    onSettled: () => Promise.all(["events", "event", "programs", "program", "program-templates", "program-template", "homecell", "homecells", "ministry", "ministries", "audit-timeline", "audit-logs"].map((key) => client.invalidateQueries({ queryKey: [key] }))),
  });
}
