import type { Event } from "@/app/modules/events/types/event.types";
import { publicApi } from "./client";

export async function getPublicEvents(params?: {
  page?: number;
  limit?: number;
  startDate?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
  });

  if (params?.startDate) {
    searchParams.set("startDate", params.startDate);
  }

  return publicApi<Event[]>(`/events?${searchParams.toString()}`);
}

export async function getPublicEvent(id: string) {
  return publicApi<Event>(`/events/${id}`);
}

export async function getPublicEventBySlug(slug: string) {
  return publicApi<Event>(`/events/${slug}`);
}
