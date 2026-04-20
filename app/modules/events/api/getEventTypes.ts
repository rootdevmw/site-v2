import { api } from "@/lib/api/client";
import { EventType } from "../types/event.types";

export async function getEventTypes() {
  const res = await api.get("/events/types");
  return res.data as { data: EventType[] };
}
