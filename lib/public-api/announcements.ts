import type { Announcement } from "@/app/modules/announcements/types/announcement.types";
import { publicApi } from "./client";

export async function getPublicAnnouncements(params?: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 5),
  });

  return publicApi<Announcement[]>(`/announcements?${searchParams.toString()}`);
}
