import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { Announcement, AnnouncementFilters } from "../types/announcement.types";

export type { AnnouncementFilters };

export async function getAnnouncements(
  params: AnnouncementFilters,
): Promise<ApiResponse<Announcement>> {
  const res = await api.get("/announcements", { params });
  return res.data;
}
