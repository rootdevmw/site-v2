import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getAnnouncements, AnnouncementFilters } from "../api/getAnnouncements";
import { Announcement } from "../types/announcement.types";

export function useAnnouncements(filters: AnnouncementFilters) {
  return usePaginatedQuery<Announcement>({
    queryKey: ["announcements", filters],
    queryFn: getAnnouncements,
    params: filters,
  });
}
