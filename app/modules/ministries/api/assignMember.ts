import { api } from "@/lib/api/client";

export async function assignMember(ministryId: string, memberId: string) {
  const res = await api.post(`/ministries/${ministryId}/members`, { memberId });
  return res.data;
}
