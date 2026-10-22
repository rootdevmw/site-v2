import type { PublicEvent } from "@/lib/utils/public-events";
import { publicApi } from "./client";

export async function getPublicEvents(
  params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    search?: string;
    period?: "upcoming" | "past";
  },
  options?: RequestInit,
) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
  });

  if (params?.startDate) {
    searchParams.set("startDate", params.startDate);
  }
  if (params?.search) searchParams.set("search", params.search);
  if (params?.period) searchParams.set("period", params.period);

  return publicApi<PublicEvent[]>(
    `/events?${searchParams.toString()}`,
    options,
  );
}

export async function getPublicEvent(id: string, options?: RequestInit) {
  return getPublicEventBySlug(id, options);
}

export async function getPublicEventBySlug(
  slug: string,
  options?: RequestInit,
) {
  return publicApi<PublicEvent>(`/events/${encodeURIComponent(slug)}`, options);
}
