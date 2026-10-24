import { api } from "@/lib/api/client";
import type { Event } from "../types/event.types";
import { getRelatedMinistries, type MinistryRelationship } from "@/lib/utils/record-details";

export async function getEvent(id: string, signal?: AbortSignal) {
  const res = await api.get<{ data: (Omit<Event, "ministries"> & { ministries?: (MinistryRelationship | null)[] | null }) | null }>(`/events/${id}`, { signal, timeout: 15000, silent: true });
  const event = res.data.data;
  return { ...res.data, data: event ? { ...event, ministries: getRelatedMinistries(event.ministries) } : null };
}
