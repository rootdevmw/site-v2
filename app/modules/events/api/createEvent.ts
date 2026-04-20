import { api } from "@/lib/api/client";
import { EventFormValues } from "../types/event.types";

export async function createEvent(data: EventFormValues) {
  const res = await api.post("/events", data);
  return res.data;
}
