import { api } from "@/lib/api/client";
import {
  Announcement,
  AnnouncementFormValues,
} from "../types/announcement.types";

export async function updateAnnouncement(
  id: string,
  data: AnnouncementFormValues,
): Promise<{ data: Announcement }> {
  const res = await api.put(`/announcements/${id}`, data);
  return res.data;
}
