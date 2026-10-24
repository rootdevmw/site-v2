import { api } from "@/lib/api/client";
import { normalizeMinistryDetails, type MinistryDetailPayload } from "../utils/ministry-details";

export async function getMinistry(id: string, signal?: AbortSignal) {
  const res = await api.get<{ data: MinistryDetailPayload | null }>(`/ministries/${id}`, { signal, timeout: 15000, silent: true });
  return { ...res.data, data: res.data.data ? normalizeMinistryDetails(res.data.data) : null };
}
