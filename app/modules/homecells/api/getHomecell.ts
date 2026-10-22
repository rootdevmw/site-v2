import { api } from "@/lib/api/client";
import { normalizeHomecellDetails, type HomecellDetailPayload } from "../utils/homecell-details";


export const getHomecell = async (id: string, signal?: AbortSignal) => {
  const res = await api.get<{ data: HomecellDetailPayload | null }>(`/homecells/${id}`, { signal, timeout: 15000, silent: true });
  return { ...res.data, data: res.data.data ? normalizeHomecellDetails(res.data.data) : null };
};
