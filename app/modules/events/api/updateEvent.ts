import { api } from "@/lib/api/client";
import { EventFormValues } from "../types/event.types";

export async function updateEvent(id: string, data: EventFormValues) {
  const res = await api.patch(`/events/${id}`, data);
  return res.data;
}
