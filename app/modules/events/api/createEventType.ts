import { api } from "@/lib/api/client";
import { EventType } from "../types/event.types";

export async function createEventType(data: {
  name: string;
}): Promise<{ data: EventType }> {
  const res = await api.post("/events/types", data);
  return res.data;
}
