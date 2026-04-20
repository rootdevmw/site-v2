import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { Event, EventFilters } from "../types/event.types";

export type { EventFilters };

export async function getEvents(
  params: EventFilters,
): Promise<ApiResponse<Event>> {
  const res = await api.get("/events", { params });
  return res.data;
}
