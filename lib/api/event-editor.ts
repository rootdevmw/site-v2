import { z } from "zod";
import { api } from "@/lib/api/client";
import type { EventEditorPayload } from "@/lib/utils/event-editor";
const type = z.object({ id: z.string().regex(/^[1-9]\d*$/), name: z.string().trim().min(1) });
export async function getEventEditorTypes(signal?: AbortSignal) {
  const response = await api.get("/events/types", { signal, timeout: 15000, silent: true });
  const parsed = z.object({ success: z.boolean().optional(), data: z.array(type) }).parse(response.data);
  if (parsed.success === false || new Set(parsed.data.map((entry) => entry.id)).size !== parsed.data.length) throw new Error("Event types could not be read.");
  return parsed.data;
}
export async function createEventEditorType(name: string) {
  const response = await api.post("/events/types", { name }, { timeout: 30000, silent: true });
  const parsed = z.object({ success: z.boolean().optional(), data: type }).parse(response.data);
  if (parsed.success === false) throw new Error("Type creation could not be confirmed.");
  return parsed.data;
}
export async function saveEventEditor(data: EventEditorPayload, id?: string) {
  const response = id ? await api.patch("/events/" + encodeURIComponent(id), data, { timeout: 30000, silent: true }) : await api.post("/events", data, { timeout: 30000, silent: true });
  const parsed = z.object({ success: z.boolean().optional(), data: z.object({ id: z.string().regex(/^[1-9]\d*$/) }) }).parse(response.data);
  if (parsed.success === false || id && parsed.data.id !== id) throw new Error("Event save could not be confirmed.");
  return parsed;
}
