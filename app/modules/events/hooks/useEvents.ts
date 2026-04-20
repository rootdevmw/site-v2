import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getEvents, EventFilters } from "../api/getEvents";
import { Event } from "../types/event.types";

export function useEvents(filters: EventFilters) {
  return usePaginatedQuery<Event>({
    queryKey: ["events", filters],
    queryFn: getEvents,
    params: filters,
  });
}
