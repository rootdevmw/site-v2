import { api } from "@/lib/api/client";

export async function deleteEvent(id: string) {
  const res = await api.delete(`/events/${id}`);
  return res.data;
}
