import { api } from "@/lib/api/client";
import { normalizeMemberDetails, type MemberDetailPayload } from "../utils/member-details";

export async function getMember(id: string, signal?: AbortSignal) {
  const res = await api.get<{ data: MemberDetailPayload | null }>(`/members/${id}`, { signal, timeout: 15000, silent: true });
  return { ...res.data, data: res.data.data ? normalizeMemberDetails(res.data.data) : null };
}
