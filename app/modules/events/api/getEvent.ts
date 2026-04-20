import { api } from "@/lib/api/client";
import { Event } from "../types/event.types";

export async function getEvent(id: string) {
  const res = await api.get(`/events/${id}`);
  return res.data as { data: Event };
}
