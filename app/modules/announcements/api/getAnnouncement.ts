import { api } from "@/lib/api/client";
import { Announcement } from "../types/announcement.types";

export async function getAnnouncement(id: string) {
  const res = await api.get(`/announcements/${id}`);
  return res.data as { data: Announcement };
}
