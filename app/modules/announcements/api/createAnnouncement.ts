import { api } from "@/lib/api/client";
import {
  Announcement,
  AnnouncementFormValues,
} from "../types/announcement.types";

export async function createAnnouncement(
  data: AnnouncementFormValues,
): Promise<{ data: Announcement }> {
  const res = await api.post("/announcements", data);
  return res.data;
}
